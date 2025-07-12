
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// API Key authentication
const API_KEY = process.env.REPLIT_API_KEY || 'mysecureapi123';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Key middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    supabase: !!supabase 
  });
});

// Get transformation rules from Supabase
app.get('/api/rules', authenticateApiKey, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const { data, error } = await supabase
      .from('transformation_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      rules: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload file to Supabase storage
app.post('/api/upload', authenticateApiKey, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const { fileName, content } = req.body;

    if (!fileName || !content) {
      return res.status(400).json({ error: 'fileName and content are required' });
    }

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('neurolint-layers')
      .upload(`api-uploads/${fileName}`, content, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    // Save metadata to transformation_rules table
    const { data: ruleData, error: ruleError } = await supabase
      .from('transformation_rules')
      .insert({
        layer: 'api-upload',
        rule: `API Upload: ${fileName}`,
        metadata: { 
          fileName, 
          uploadPath: uploadData.path,
          uploadedVia: 'api',
          timestamp: new Date().toISOString()
        }
      })
      .select();

    if (ruleError) {
      console.warn('Metadata save warning:', ruleError);
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileName,
        uploadPath: uploadData.path,
        ruleId: ruleData?.[0]?.id
      }
    });

  } catch (error) {
    console.error('Upload API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize transformation rules table and storage bucket
app.post('/api/init', authenticateApiKey, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const results = {
      table: false,
      bucket: false,
      rules: 0
    };

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some(bucket => bucket.name === 'neurolint-layers');
    
    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket('neurolint-layers', {
        public: false,
        fileSizeLimit: 1024 * 1024 * 10 // 10MB
      });
      
      if (!bucketError) {
        results.bucket = true;
      }
    } else {
      results.bucket = true;
    }

    // Check if transformation_rules table exists and populate with layer rules
    const layerRules = [
      { layer: 1, rule: 'TypeScript target upgrade to ES2022' },
      { layer: 1, rule: 'Enable React Strict Mode in Next.js config' },
      { layer: 2, rule: 'Fix HTML entity corruption (&quot;, &amp;)' },
      { layer: 2, rule: 'Convert var to const/let declarations' },
      { layer: 3, rule: 'Add missing key props to React lists' },
      { layer: 3, rule: 'Add missing accessibility attributes' },
      { layer: 4, rule: 'Add SSR guards for localStorage access' },
      { layer: 4, rule: 'Add mounted state for hydration' },
      { layer: 5, rule: 'Add use client directive for Next.js' },
      { layer: 5, rule: 'Fix Next.js import order issues' },
      { layer: 6, rule: 'Add React Testing Library imports' },
      { layer: 6, rule: 'Add proper test cleanup patterns' }
    ];

    for (const rule of layerRules) {
      const { error } = await supabase
        .from('transformation_rules')
        .upsert({
          layer: rule.layer.toString(),
          rule: rule.rule,
          metadata: { 
            type: 'system-rule',
            description: `Layer ${rule.layer} transformation rule`
          }
        });

      if (!error) {
        results.rules++;
      }
    }

    results.table = true;

    res.json({
      success: true,
      message: 'Initialization completed',
      results
    });

  } catch (error) {
    console.error('Init API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NeuroLint API Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 API Key required for protected endpoints`);
  
  if (supabase) {
    console.log('✅ Supabase connected');
  } else {
    console.log('⚠️  Supabase not configured - set SUPABASE_URL and SUPABASE_ANON_KEY');
  }
});

module.exports = app;
