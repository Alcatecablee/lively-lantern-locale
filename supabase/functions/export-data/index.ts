
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
    const { export_type, filters, format = 'csv' } = await req.json()

    // Create export job
    const { data: job, error: jobError } = await supabase
      .from('database_exports')
      .insert({
        table_name: export_type,
        export_type: format,
        status: 'processing',
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (jobError) {
      throw jobError
    }

    let data = []
    let headers = []

    // Export different types of data
    switch (export_type) {
      case 'users':
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles(role)
          `)

        if (usersError) throw usersError
        data = users
        headers = ['id', 'email', 'full_name', 'status', 'created_at', 'role']
        break

      case 'analysis_projects':
        const { data: projects, error: projectsError } = await supabase
          .from('analysis_projects')
          .select('*')

        if (projectsError) throw projectsError
        data = projects
        headers = ['id', 'name', 'description', 'status', 'file_count', 'total_issues', 'created_at']
        break

      case 'activity_logs':
        const { data: logs, error: logsError } = await supabase
          .from('activity_logs')
          .select(`
            *,
            profiles(email, full_name)
          `)
          .order('created_at', { ascending: false })

        if (logsError) throw logsError
        data = logs
        headers = ['id', 'action', 'resource_type', 'user_email', 'created_at']
        break

      default:
        throw new Error('Invalid export type')
    }

    // Generate CSV content
    const csvContent = generateCSV(data, headers, export_type)

    // Update job status
    await supabase
      .from('database_exports')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        record_count: data.length,
        file_size: csvContent.length
      })
      .eq('id', job.id)

    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${export_type}_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting data:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function generateCSV(data: any[], headers: string[], exportType: string): string {
  const csvHeaders = headers.join(',')
  
  const csvRows = data.map(item => {
    return headers.map(header => {
      let value = ''
      
      switch (header) {
        case 'role':
          value = item.user_roles?.[0]?.role || 'user'
          break
        case 'user_email':
          value = item.profiles?.email || ''
          break
        case 'created_at':
          value = new Date(item.created_at).toISOString().split('T')[0]
          break
        default:
          value = item[header] || ''
      }
      
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`
      }
      
      return value
    }).join(',')
  })

  return [csvHeaders, ...csvRows].join('\n')
}
