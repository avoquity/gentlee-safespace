
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.18.0?target=deno'

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the raw request body
    const body = await req.text()
    
    // Get the Stripe signature from the headers
    const signature = req.headers.get('stripe-signature')
    
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing Stripe signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET')
    }

    // Verify the webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        global: {
          headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
        },
      }
    )

    // Process different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        // Payment is successful and the subscription is created
        const session = event.data.object

        // Find customer and add subscription data to profiles table
        if (session.customer && session.subscription) {
          // Get user email from customer object
          const customer = await stripe.customers.retrieve(String(session.customer))
          const userEmail = customer.email

          if (userEmail) {
            // Find user by email
            const { data: userData, error: userError } = await supabaseClient
              .from('auth')
              .select('users(id)')
              .eq('users.email', userEmail)
              .single()

            if (userError) {
              console.error('Error finding user:', userError)
              break
            }

            if (userData && userData.users && userData.users.id) {
              const userId = userData.users.id

              // Update user profile with subscription info
              const { error: updateError } = await supabaseClient
                .from('profiles')
                .update({
                  subscription_id: String(session.subscription),
                  subscription_status: 'active',
                  subscription_plan: session.metadata?.plan || 'monthly',
                  subscription_start_date: new Date().toISOString(),
                })
                .eq('id', userId)

              if (updateError) {
                console.error('Error updating profile:', updateError)
              }
            }
          }
        }
        break
      }
      
      case 'invoice.payment_succeeded': {
        // Continuing subscription payments
        const invoice = event.data.object
        
        if (invoice.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(String(invoice.subscription))
          
          if (subscription.customer) {
            // Get customer details
            const customer = await stripe.customers.retrieve(String(subscription.customer))
            const userEmail = customer.email
            
            if (userEmail) {
              // Find user by email
              const { data: userData, error: userError } = await supabaseClient
                .from('auth')
                .select('users(id)')
                .eq('users.email', userEmail)
                .single()

              if (userError || !userData) {
                console.error('Error finding user:', userError)
                break
              }

              if (userData.users && userData.users.id) {
                // Update subscription status to active
                const { error: updateError } = await supabaseClient
                  .from('profiles')
                  .update({
                    subscription_status: 'active',
                    subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  })
                  .eq('id', userData.users.id)

                if (updateError) {
                  console.error('Error updating profile:', updateError)
                }
              }
            }
          }
        }
        break
      }
      
      case 'customer.subscription.updated': {
        // Subscription was updated (upgrade, downgrade, etc)
        const subscription = event.data.object
        
        if (subscription.customer) {
          // Get customer details
          const customer = await stripe.customers.retrieve(String(subscription.customer))
          const userEmail = customer.email
          
          if (userEmail) {
            // Find user by email
            const { data: userData, error: userError } = await supabaseClient
              .from('auth')
              .select('users(id)')
              .eq('users.email', userEmail)
              .single()

            if (userError || !userData) {
              console.error('Error finding user:', userError)
              break
            }

            if (userData.users && userData.users.id) {
              // Update subscription details
              const { error: updateError } = await supabaseClient
                .from('profiles')
                .update({
                  subscription_status: subscription.status,
                  subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                })
                .eq('id', userData.users.id)

              if (updateError) {
                console.error('Error updating profile:', updateError)
              }
            }
          }
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        // Subscription was canceled or expired
        const subscription = event.data.object
        
        if (subscription.customer) {
          // Get customer details
          const customer = await stripe.customers.retrieve(String(subscription.customer))
          const userEmail = customer.email
          
          if (userEmail) {
            // Find user by email
            const { data: userData, error: userError } = await supabaseClient
              .from('auth')
              .select('users(id)')
              .eq('users.email', userEmail)
              .single()

            if (userError || !userData) {
              console.error('Error finding user:', userError)
              break
            }

            if (userData.users && userData.users.id) {
              // Update subscription status to canceled or expired
              const { error: updateError } = await supabaseClient
                .from('profiles')
                .update({
                  subscription_status: 'canceled',
                  subscription_end_date: new Date().toISOString(),
                })
                .eq('id', userData.users.id)

              if (updateError) {
                console.error('Error updating profile:', updateError)
              }
            }
          }
        }
        break
      }
    }

    // Return a success response
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
