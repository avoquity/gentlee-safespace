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
      console.error('Missing Stripe signature')
      return new Response(
        JSON.stringify({ error: 'Missing Stripe signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('Missing STRIPE_SECRET_KEY')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the webhook signature
    let event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase credentials')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        global: {
          headers: { Authorization: `Bearer ${supabaseServiceRoleKey}` },
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
          const userId = session.metadata?.user_id

          if (userId) {
            console.log(`Updating subscription for user with ID: ${userId}`)
            
            // Update user profile with subscription info using metadata user_id
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
              console.error('Error updating profile by user_id:', updateError)
            } else {
              console.log(`Updated subscription for user ${userId}`)
            }
          } else {
            // If no user_id in metadata, try to find user by customer email
            // Get user email from customer object
            const customer = await stripe.customers.retrieve(String(session.customer))
            const userEmail = customer.email

            if (userEmail) {
              console.log(`Looking for user with email: ${userEmail}`)
              
              // Find user by email
              const { data: authUsers, error: authUserError } = await supabaseClient
                .auth.admin.listUsers()

              if (authUserError) {
                console.error('Error listing users:', authUserError)
              } else {
                const user = authUsers.users.find(u => u.email === userEmail)
                
                if (!user) {
                  console.error('User not found by email')
                } else {
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
                }
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
              } else {
                const user = authUsers.users.find(u => u.email === userEmail)
                
                if (!user) {
                  console.error('User not found by email')
                } else {
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
            } else {
              const user = authUsers.users.find(u => u.email === userEmail)
              
              if (!user) {
                console.error('User not found by email')
              } else {
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
            } else {
              const user = authUsers.users.find(u => u.email === userEmail)
              
              if (!user) {
                console.error('User not found by email')
              } else {
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
    console.error('Error processing webhook:', error.message)
    console.error(error.stack)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
