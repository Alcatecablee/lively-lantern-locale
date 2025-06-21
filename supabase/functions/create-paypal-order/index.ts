
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planName, amount, isSubscription } = await req.json();

    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const PAYPAL_ENVIRONMENT = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';
    
    const PAYPAL_BASE_URL = PAYPAL_ENVIRONMENT === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    console.log('PayPal Environment:', PAYPAL_ENVIRONMENT);
    console.log('PayPal Base URL:', PAYPAL_BASE_URL);
    console.log('PayPal Client ID available:', !!PAYPAL_CLIENT_ID);
    console.log('PayPal Client Secret available:', !!PAYPAL_CLIENT_SECRET);

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error('PayPal credentials missing:', { 
        hasClientId: !!PAYPAL_CLIENT_ID, 
        hasClientSecret: !!PAYPAL_CLIENT_SECRET 
      });
      throw new Error('PayPal credentials not configured');
    }

    console.log('Getting PayPal access token...');

    // Get PayPal access token
    const tokenResponse = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get PayPal token:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      throw new Error(`Failed to get PayPal access token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('PayPal token obtained successfully');

    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      throw new Error('Invalid token response from PayPal');
    }

    const accessToken = tokenData.access_token;

    // Create order data
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount.toString(),
        },
        description: `${planName} Plan${isSubscription ? ' Subscription' : ''}`,
      }],
      application_context: {
        return_url: `${req.headers.get('origin') || 'http://localhost:3000'}/payment/success`,
        cancel_url: `${req.headers.get('origin') || 'http://localhost:3000'}/payment/cancel`,
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    };

    console.log('Creating PayPal order with data:', JSON.stringify(orderData, null, 2));

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': crypto.randomUUID(),
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Failed to create PayPal order:', {
        status: orderResponse.status,
        statusText: orderResponse.statusText,
        error: errorText
      });
      throw new Error(`Failed to create PayPal order: ${errorText}`);
    }

    const order = await orderResponse.json();
    console.log('PayPal order created successfully:', { id: order.id, status: order.status });

    return new Response(
      JSON.stringify({ orderID: order.id }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check the function logs for more information'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
