
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

    console.log(`Processing webhook event: ${event.type}`)

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
            console.log(`Looking for user with email: ${userEmail}`)
            
            // Find user by email
            const { data: users, error: userError } = await supabaseClient
              .from('profiles')
              .select('id')
              .eq('id', session.metadata?.user_id)
              .maybeSingle()

            if (userError) {
              console.error('Error finding user:', userError)
              break
            }

            // If user not found by metadata, try to find by email
            if (!users) {
              const { data: authUsers, error: authUserError } = await supabaseClient
                .auth.admin.listUsers()

              if (authUserError) {
                console.error('Error listing users:', authUserError)
                break
              }

              const user = authUsers.users.find(u => u.email === userEmail)
              
              if (!user) {
                console.error('User not found by email')
                break
              }

              // Update user profile with subscription info
              const { error: updateError } = await supabaseClient
                .from('profiles')
                .update({
                  subscription_id: String(session.subscription),
                  subscription_status: 'active',
                  subscription_plan: session.metadata?.plan || 'monthly',
                  subscription_start_date: new Date().toISOString(),
                })
                .eq('id', user.id)

              if (updateError) {
                console.error('Error updating profile:', updateError)
              } else {
                console.log(`Updated subscription for user ${user.id}`)
              }
            } else {
              // Update user profile with subscription info using metadata user_id
              const { error: updateError } = await supabaseClient
                .from('profiles')
                .update({
                  subscription_id: String(session.subscription),
                  subscription_status: 'active',
                  subscription_plan: session.metadata?.plan || 'monthly',
                  subscription_start_date: new Date().toISOString(),
                })
                .eq('id', session.metadata?.user_id)

              if (updateError) {
                console.error('Error updating profile by metadata user_id:', updateError)
              } else {
                console.log(`Updated subscription for user ${session.metadata?.user_id}`)
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
              console.log(`Invoice payment succeeded for user with email: ${userEmail}`)

              // Find user by email
              const { data: authUsers, error: authUserError } = await supabaseClient
                .auth.admin.listUsers()

              if (authUserError) {
                console.error('Error listing users:', authUserError)
                break
              }

              const user = authUsers.users.find(u => u.email === userEmail)
              
              if (!user) {
                console.error('User not found by email')
                break
              }

              // Update subscription status to active
              const { error: updateError } = await supabaseClient
                .from('profiles')
                .update({
                  subscription_status: 'active',
                  subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                })
                .eq('id', user.id)

              if (updateError) {
                console.error('Error updating profile:', updateError)
              } else {
                console.log(`Updated subscription period for user ${user.id}`)
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
            console.log(`Subscription updated for user with email: ${userEmail}`)

            // Find user by email
            const { data: authUsers, error: authUserError } = await supabaseClient
              .auth.admin.listUsers()

            if (authUserError) {
              console.error('Error listing users:', authUserError)
              break
            }

            const user = authUsers.users.find(u => u.email === userEmail)
            
            if (!user) {
              console.error('User not found by email')
              break
            }

            // Update subscription details
            const { error: updateError } = await supabaseClient
              .from('profiles')
              .update({
                subscription_status: subscription.status,
                subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq('id', user.id)

            if (updateError) {
              console.error('Error updating profile:', updateError)
            } else {
              console.log(`Updated subscription status for user ${user.id}`)
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
            console.log(`Subscription deleted for user with email: ${userEmail}`)

            // Find user by email
            const { data: authUsers, error: authUserError } = await supabaseClient
              .auth.admin.listUsers()

            if (authUserError) {
              console.error('Error listing users:', authUserError)
              break
            }

            const user = authUsers.users.find(u => u.email === userEmail)
            
            if (!user) {
              console.error('User not found by email')
              break
            }

            // Update subscription status to canceled or expired
            const { error: updateError } = await supabaseClient
              .from('profiles')
              .update({
                subscription_status: 'canceled',
                subscription_end_date: new Date().toISOString(),
              })
              .eq('id', user.id)

            if (updateError) {
              console.error('Error updating profile:', updateError)
            } else {
              console.log(`Updated subscription status to canceled for user ${user.id}`)
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
