
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { orderID, planName, isSubscription } = await req.json();

    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const PAYPAL_ENVIRONMENT = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';
    
    const PAYPAL_BASE_URL = PAYPAL_ENVIRONMENT === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials not configured');
    }

    console.log('Capturing PayPal order:', orderID);

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
      console.error('Failed to get PayPal token:', errorText);
      throw new Error(`Failed to get PayPal access token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error('Invalid token response from PayPal');
    }

    const accessToken = tokenData.access_token;

    // Capture the PayPal order
    const captureResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': crypto.randomUUID(),
      },
    });

    if (!captureResponse.ok) {
      const errorText = await captureResponse.text();
      console.error('Failed to capture PayPal order:', errorText);
      throw new Error(`Failed to capture PayPal order: ${errorText}`);
    }

    const captureData = await captureResponse.json();
    console.log('PayPal order captured successfully:', { id: orderID, status: captureData.status });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User authentication error:', userError);
      throw new Error('User not authenticated');
    }

    console.log('Processing payment for user:', user.id);

    // Update user profile with subscription status if needed
    if (isSubscription && captureData.status === 'COMPLETED') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          subscription_plan: planName.toLowerCase(),
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
      } else {
        console.log('User profile updated with subscription');
      }
    }

    // Log the activity
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'payment_completed',
        details: {
          plan: planName,
          amount: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value,
          currency: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code,
          is_subscription: isSubscription,
          paypal_order_id: orderID
        }
      });

    if (logError) {
      console.error('Error logging activity:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentDetails: captureData,
        subscription: isSubscription ? { plan: planName, status: 'active' } : null
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error capturing PayPal order:', error);
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
