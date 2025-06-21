
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
    const url = new URL(req.url)
    const path = url.pathname.replace('/api', '')
    const method = req.method

    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const apiKey = authHeader.replace('Bearer ', '')
    
    // Validate API key and get user
    const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey))
    const hashArray = Array.from(new Uint8Array(keyHash))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: keyData, error: keyError } = await supabase
      .from('user_api_keys')
      .select('user_id, is_active, rate_limit_per_minute')
      .eq('key_hash', hashHex)
      .eq('is_active', true)
      .single()

    if (keyError || !keyData) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Log API usage
    await supabase.from('api_usage_logs').insert({
      api_key_id: keyData.user_id,
      endpoint: path,
      method: method,
      status_code: 200
    })

    // Route API requests
    if (path === '/analyze' && method === 'POST') {
      return await handleAnalyze(req, supabase, keyData.user_id)
    } else if (path === '/projects' && method === 'GET') {
      return await handleGetProjects(supabase, keyData.user_id)
    } else if (path.startsWith('/projects/') && method === 'GET') {
      const projectId = path.split('/')[2]
      return await handleGetProject(supabase, keyData.user_id, projectId)
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleAnalyze(req: Request, supabase: any, userId: string) {
  const body = await req.json()
  const { files, projectName } = body

  if (!files || !Array.isArray(files)) {
    return new Response(JSON.stringify({ error: 'Files array is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Create analysis project
  const { data: project, error: projectError } = await supabase
    .from('analysis_projects')
    .insert({
      user_id: userId,
      name: projectName || `API Analysis ${new Date().toISOString()}`,
      file_count: files.length,
      status: 'completed'
    })
    .select()
    .single()

  if (projectError) {
    return new Response(JSON.stringify({ error: 'Failed to create project' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Mock analysis results for now
  const results = files.map((file: any) => ({
    project_id: project.id,
    file_name: file.name,
    file_content: file.content,
    issues: [
      {
        type: 'warning',
        message: 'Consider using React.memo for performance optimization',
        line: 10,
        severity: 'medium'
      }
    ],
    metrics: {
      complexity: Math.floor(Math.random() * 10),
      maintainability: Math.floor(Math.random() * 100),
      testability: Math.floor(Math.random() * 100)
    }
  }))

  // Insert analysis results
  const { error: resultsError } = await supabase
    .from('analysis_results')
    .insert(results)

  if (resultsError) {
    return new Response(JSON.stringify({ error: 'Failed to save results' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    project_id: project.id,
    status: 'completed',
    results: results
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleGetProjects(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('analysis_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch projects' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleGetProject(supabase: any, userId: string, projectId: string) {
  const { data: project, error: projectError } = await supabase
    .from('analysis_projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (projectError) {
    return new Response(JSON.stringify({ error: 'Project not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { data: results, error: resultsError } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('project_id', projectId)

  if (resultsError) {
    return new Response(JSON.stringify({ error: 'Failed to fetch results' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    ...project,
    results: results
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}
