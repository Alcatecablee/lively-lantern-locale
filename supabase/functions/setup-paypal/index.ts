
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // This is a helper endpoint to document the required PayPal secrets
    const requiredSecrets = {
      PAYPAL_CLIENT_ID: "Your PayPal Client ID from PayPal Developer Dashboard",
      PAYPAL_CLIENT_SECRET: "Your PayPal Client Secret from PayPal Developer Dashboard",
      PAYPAL_ENVIRONMENT: "sandbox or live"
    }

    return new Response(
      JSON.stringify({
        message: "PayPal setup information",
        requiredSecrets,
        instructions: [
          "1. Go to https://developer.paypal.com",
          "2. Create an application",
          "3. Copy the Client ID and Client Secret",
          "4. Set these as secrets in your Supabase project"
        ]
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})
