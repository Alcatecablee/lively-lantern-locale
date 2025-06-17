
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { plan_type, amount, user_id } = await req.json()

    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const paypalEnvironment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox'

    const paypalBaseUrl = paypalEnvironment === 'production' 
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com'

    // Get PayPal access token
    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    const authData = await authResponse.json()

    // Create subscription
    const subscriptionData = {
      plan_id: `neurolint-${plan_type}`,
      application_context: {
        brand_name: 'NeuroLint',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${req.headers.get('origin')}/billing?success=true`,
        cancel_url: `${req.headers.get('origin')}/billing?cancelled=true`
      },
      subscriber: {
        name: {
          given_name: 'User',
          surname: 'Name'
        }
      }
    }

    const subscriptionResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`
      },
      body: JSON.stringify(subscriptionData)
    })

    const subscription = await subscriptionResponse.json()

    return new Response(
      JSON.stringify({ 
        subscription_id: subscription.id,
        approve_link: subscription.links.find((link: any) => link.rel === 'approve')?.href
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
