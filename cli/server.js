
const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Import NeuroLint components
const EnhancedNeuroLintOrchestrator = require('./enhanced-orchestrator');
const EnhancedSmartLayerSelector = require('./orchestration/enhanced-selector');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    supabase: supabase ? 'connected' : 'not configured'
  });
});

// Get transformation rules from Supabase
app.get('/api/rules', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const { data, error } = await supabase
      .from('transformation_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.json({ rules: data || [] });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload file and get analysis
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const { originalname, path: tempPath } = req.file;
    const content = await fs.readFile(tempPath, 'utf8');
    
    // Clean up temp file
    await fs.unlink(tempPath);

    // Analyze with NeuroLint
    const analysis = EnhancedSmartLayerSelector.analyzeAndRecommend(content, originalname);

    // Upload to Supabase if configured
    if (supabase) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('neurolint-files')
        .upload(`uploads/${originalname}`, content, {
          contentType: 'text/plain',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
      }

      // Save metadata
      if (!uploadError) {
        const { error: ruleError } = await supabase
          .from('transformation_rules')
          .insert({
            layer: 'analysis',
            rule: `File analysis: ${originalname}`,
            metadata: {
              filename: originalname,
              uploadPath: uploadData?.path,
              recommendedLayers: analysis.recommendedLayers,
              confidence: analysis.confidence,
              detectedIssues: analysis.detectedIssues?.length || 0
            }
          });

        if (ruleError) {
          console.warn('Metadata save warning:', ruleError);
        }
      }
    }

    res.json({
      filename: originalname,
      analysis: analysis,
      uploaded: !!supabase && !uploadError
    });

  } catch (error) {
    console.error('Upload API error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Execute NeuroLint transformation
app.post('/api/transform', async (req, res) => {
  const { code, filename = 'uploaded.js', layers = [1, 2, 3, 4], options = {} } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const orchestrator = new EnhancedNeuroLintOrchestrator({
      verbose: false,
      dryRun: true,
      useAST: options.useAST !== false,
      useCache: options.useCache !== false
    });

    const result = await orchestrator.execute(code, filename, layers);

    res.json({
      success: result.success,
      originalCode: code,
      transformedCode: result.finalCode || code,
      analysis: result.analysis,
      layerResults: result.layerResults,
      performance: result.performance,
      recommendations: result.recommendations || []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      originalCode: code
    });
  }
});

// Get file from Supabase storage
app.get('/api/files/:filename', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const { filename } = req.params;
    
    const { data, error } = await supabase.storage
      .from('neurolint-files')
      .download(`uploads/${filename}`);

    if (error) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = await data.text();
    res.json({ filename, content });

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

// Add transformation rule
app.post('/api/rules', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const { layer, rule, description, pattern, replacement } = req.body;

  if (!layer || !rule) {
    return res.status(400).json({ error: 'Layer and rule are required' });
  }

  try {
    const { data, error } = await supabase
      .from('transformation_rules')
      .insert({
        layer,
        rule,
        description,
        pattern,
        replacement,
        metadata: { createdVia: 'API' }
      })
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to create rule' });
    }

    res.json({ rule: data[0] });

  } catch (error) {
    console.error('Init API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`NeuroLint API Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Key required for protected endpoints`);
  
  if (supabase) {
    console.log('SUCCESS: Supabase connected');
  } else {
    console.log('WARNING: Supabase not configured - set SUPABASE_URL and SUPABASE_ANON_KEY');
  }
});

module.exports = app;
