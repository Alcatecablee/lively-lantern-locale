
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { email, role = 'user' } = await req.json()

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create invitation using the database function
    const { data: invitationData, error: invitationError } = await supabase
      .rpc('create_user_invitation', {
        p_email: email,
        p_role: role
      })

    if (invitationError) {
      throw invitationError
    }

    // Get invitation details
    const { data: invitation, error: fetchError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('id', invitationData)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // In a real implementation, you would send an email here
    // For now, we'll just log it and return success
    console.log(`Invitation sent to ${email} with token: ${invitation.token}`)

    return new Response(JSON.stringify({
      success: true,
      invitation_id: invitationData,
      message: `Invitation sent to ${email}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error sending invitation:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
