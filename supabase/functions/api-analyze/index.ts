import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ReactCodeAnalyzer } from '../../../src/lib/ReactCodeAnalyzer.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ApiRequest {
  code: string;
  fileName?: string;
  options?: {
    includeCustomRules?: boolean;
    teamId?: string;
    format?: 'json' | 'markdown' | 'text';
    applyAutoFix?: boolean;
  };
}

interface ApiResponse {
  success: boolean;
  data?: {
    issues: any[];
    metrics: any;
    fixedCode?: string;
    customRulesApplied?: number;
    usage: {
      requestCount: number;
      remainingRequests: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Extract API key from headers
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'MISSING_API_KEY',
            message: 'API key is required. Get yours from your NeuroLint dashboard.',
          },
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate API key and get user info
    const { data: keyData, error: keyError } = await supabaseClient
      .from('user_api_keys')
      .select(`
        *,
        profiles!inner (
          id,
          email,
          subscription_plan,
          subscription_status
        ),
        teams (
          id,
          subscription_plan,
          subscription_status
        )
      `)
      .eq('key_hash', await hashApiKey(apiKey))
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_API_KEY',
            message: 'Invalid or inactive API key.',
          },
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check subscription status
    const hasActiveSubscription = 
      (keyData.profiles.subscription_status === 'active' && 
       ['team', 'enterprise'].includes(keyData.profiles.subscription_plan)) ||
      (keyData.teams && 
       keyData.teams.subscription_status === 'active' && 
       ['team', 'enterprise'].includes(keyData.teams.subscription_plan));

    if (!hasActiveSubscription) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'SUBSCRIPTION_REQUIRED',
            message: 'Active Team or Enterprise subscription required for API access.',
          },
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(supabaseClient, keyData.id);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Try again in ${rateLimitResult.resetTime} seconds.`,
          },
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const requestBody: ApiRequest = await req.json();
    const { code, fileName = 'Component.tsx', options = {} } = requestBody;

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Code parameter is required and must be a string.',
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize analyzer
    const analyzer = new ReactCodeAnalyzer();
    
    // Analyze code
    const analysis = analyzer.analyzeCode(code, fileName);
    let customRulesApplied = 0;

    // Apply custom rules if requested and available
    if (options.includeCustomRules && keyData.profiles.subscription_plan === 'enterprise') {
      const customRules = await getCustomRules(supabaseClient, keyData.profiles.id, options.teamId);
      const customIssues = applyCustomRules(code, fileName, customRules);
      analysis.issues.push(...customIssues);
      customRulesApplied = customRules.length;
    }

    // Apply auto-fixes if requested
    let fixedCode = code;
    if (options.applyAutoFix) {
      fixedCode = analyzer.applyAllFixes(code, analysis.issues);
    }

    // Format response based on requested format
    let responseData: any = {
      issues: analysis.issues,
      metrics: analysis.metrics,
      customRulesApplied,
      usage: {
        requestCount: rateLimitResult.currentCount + 1,
        remainingRequests: rateLimitResult.limit - rateLimitResult.currentCount - 1,
      },
    };

    if (options.applyAutoFix) {
      responseData.fixedCode = fixedCode;
    }

    // Format response based on requested format
    if (options.format === 'markdown') {
      responseData = formatAsMarkdown(responseData);
    } else if (options.format === 'text') {
      responseData = formatAsText(responseData);
    }

    // Log API usage
    await logApiUsage(supabaseClient, keyData.id, {
      endpoint: 'analyze',
      code_length: code.length,
      issues_found: analysis.issues.length,
      custom_rules_applied: customRulesApplied,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('API Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal error occurred while processing your request.',
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper functions
async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkRateLimit(supabaseClient: any, keyId: string) {
  const now = new Date();
  const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

  // Get current hour's usage
  const { data: usage, error } = await supabaseClient
    .from('api_usage_log')
    .select('*')
    .eq('api_key_id', keyId)
    .gte('created_at', hourStart.toISOString())
    .lt('created_at', new Date(hourStart.getTime() + 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, currentCount: 0, limit: 1000, resetTime: 0 }; // Fail open
  }

  const currentCount = usage?.length || 0;
  const limit = 1000; // 1000 requests per hour for API users
  const resetTime = Math.ceil((hourStart.getTime() + 60 * 60 * 1000 - now.getTime()) / 1000);

  return {
    allowed: currentCount < limit,
    currentCount,
    limit,
    resetTime,
  };
}

async function getCustomRules(supabaseClient: any, userId: string, teamId?: string) {
  let query = supabaseClient
    .from('custom_rules')
    .select('*')
    .eq('is_active', true);

  if (teamId) {
    query = query.or(`user_id.eq.${userId},team_id.eq.${teamId}`);
  } else {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching custom rules:', error);
    return [];
  }

  return data || [];
}

function applyCustomRules(code: string, fileName: string, rules: any[]): any[] {
  const issues: any[] = [];
  const lines = code.split('\n');

  for (const rule of rules) {
    lines.forEach((line, index) => {
      let matches = false;
      let message = '';

      // Simple pattern matching based on rule type
      switch (rule.rule_type) {
        case 'best-practices':
          if (rule.name.includes('Console') && line.includes('console.')) {
            matches = true;
            message = `${rule.name}: ${rule.description}`;
          }
          break;

        case 'performance':
          if (rule.name.includes('Inline') && line.includes('style={{')) {
            matches = true;
            message = `${rule.name}: Move inline styles to a separate object`;
          }
          break;

        case 'accessibility':
          if (rule.name.includes('Alt') && line.includes('<img') && !line.includes('alt=')) {
            matches = true;
            message = `${rule.name}: Missing alt attribute on img element`;
          }
          break;

        case 'security':
          if (rule.name.includes('Random') && line.includes('Math.random()')) {
            matches = true;
            message = `${rule.name}: Use crypto.getRandomValues() for secure randomness`;
          }
          break;
      }

      if (matches) {
        issues.push({
          type: rule.name.toLowerCase().replace(/\s+/g, '-'),
          severity: rule.severity,
          message,
          line: index + 1,
          column: 1,
          suggestion: rule.description,
          autoFixable: rule.auto_fixable,
          customRule: true,
          ruleId: rule.id,
        });
      }
    });
  }

  return issues;
}

async function logApiUsage(supabaseClient: any, keyId: string, metadata: any) {
  try {
    await supabaseClient
      .from('api_usage_log')
      .insert({
        api_key_id: keyId,
        endpoint: metadata.endpoint,
        metadata: {
          code_length: metadata.code_length,
          issues_found: metadata.issues_found,
          custom_rules_applied: metadata.custom_rules_applied,
        },
      });
  } catch (error) {
    console.error('Error logging API usage:', error);
    // Don't fail the request if logging fails
  }
}

function formatAsMarkdown(data: any): string {
  let markdown = '# NeuroLint Analysis Report\n\n';
  
  markdown += `## Summary\n`;
  markdown += `- **Issues Found**: ${data.issues.length}\n`;
  markdown += `- **Custom Rules Applied**: ${data.customRulesApplied}\n`;
  if (data.fixedCode) {
    markdown += `- **Auto-fixes Applied**: Available\n`;
  }
  markdown += '\n';

  if (data.issues.length > 0) {
    markdown += '## Issues\n\n';
    
    const issuesByType = data.issues.reduce((acc: any, issue: any) => {
      const type = issue.type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(issue);
      return acc;
    }, {});

    for (const [type, issues] of Object.entries(issuesByType)) {
      markdown += `### ${type.charAt(0).toUpperCase() + type.slice(1)}\n\n`;
      
      (issues as any[]).forEach((issue, index) => {
        markdown += `${index + 1}. **Line ${issue.line}**: ${issue.message}\n`;
        if (issue.suggestion) {
          markdown += `   - Suggestion: ${issue.suggestion}\n`;
        }
        if (issue.autoFixable) {
          markdown += `   - ✅ Auto-fixable\n`;
        }
        if (issue.customRule) {
          markdown += `   - 🔧 Custom Rule\n`;
        }
        markdown += '\n';
      });
    }
  }

  if (data.metrics) {
    markdown += '## Metrics\n\n';
    markdown += `- **Complexity Score**: ${data.metrics.complexityScore || 'N/A'}\n`;
    markdown += `- **Maintainability**: ${data.metrics.maintainability || 'N/A'}\n`;
    markdown += `- **Performance Score**: ${data.metrics.performanceScore || 'N/A'}\n`;
    markdown += '\n';
  }

  return markdown;
}

function formatAsText(data: any): string {
  let text = 'NEUROLINT ANALYSIS REPORT\n';
  text += '='.repeat(25) + '\n\n';
  
  text += `Issues Found: ${data.issues.length}\n`;
  text += `Custom Rules Applied: ${data.customRulesApplied}\n`;
  if (data.fixedCode) {
    text += `Auto-fixes: Available\n`;
  }
  text += '\n';

  if (data.issues.length > 0) {
    text += 'ISSUES:\n';
    text += '-'.repeat(20) + '\n';
    
    data.issues.forEach((issue: any, index: number) => {
      text += `${index + 1}. Line ${issue.line}: ${issue.message}\n`;
      if (issue.suggestion) {
        text += `   Suggestion: ${issue.suggestion}\n`;
      }
      if (issue.autoFixable) {
        text += `   [Auto-fixable]\n`;
      }
      if (issue.customRule) {
        text += `   [Custom Rule]\n`;
      }
      text += '\n';
    });
  }

  return text;
} 