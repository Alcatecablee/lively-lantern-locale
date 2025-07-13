#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Enhanced NeuroLint Orchestrator (CLI entry point)
const EnhancedNeuroLintOrchestrator = require('./enhanced-orchestrator');
const EnhancedSmartLayerSelector = require('./orchestration/enhanced-selector');
const LayerIntegrator = require('./layer-integrator');

// Enterprise banner - no colors, no emojis
const banner = `
NeuroLint Enterprise CLI v1.0.0
Enterprise Code Quality Automation System
`;

/**
 * Main CLI function for enhanced analysis
 */
async function analyzeEnhanced(file, options = {}) {
  if (!fs.existsSync(file)) {
    console.error(`ERROR: File not found: ${file}`);
    process.exit(1);
  }

  const code = fs.readFileSync(file, 'utf8');
  
  try {
    console.log(banner);
    console.log('NeuroLint Enhanced Analysis Starting...');
    console.log(`PROCESSING: ${file}`);
    
    if (options.dryRun) {
      console.log('MODE: DRY RUN - No files will be modified');
    }

    // Initialize orchestrator
    const orchestrator = new EnhancedNeuroLintOrchestrator({
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      useAST: options.useAST !== false,
      useCache: options.useCache !== false,
      createBackups: options.backup || false
    });

    // Execute analysis
    const result = await orchestrator.execute(code, file, options.layers || [1, 2, 3, 4]);

    console.log('\nAnalysis completed successfully!');

    // Display results
    console.log('\nANALYSIS SUMMARY:');
    console.log(`  Detected Issues: ${result.analysis.detectedIssues.length}`);
    console.log(`  Executed Layers: ${result.executedLayers.join(', ')}`);
    console.log(`  Total Execution Time: ${result.performance.totalExecutionTime}ms`);
    console.log(`  Confidence: ${(result.analysis.confidence * 100).toFixed(1)}%`);

    console.log('\nLAYER RESULTS:');
    result.layerResults.forEach(layer => {
      const status = layer.success ? 'SUCCESS' : 'FAILED';
      const skipped = layer.skipped ? ' (skipped)' : '';
      console.log(`  ${status} Layer ${layer.layerId}: ${layer.name} - ${layer.changeCount} changes${skipped}`);
      
      if (layer.improvements && layer.improvements.length > 0) {
        layer.improvements.forEach(improvement => {
          console.log(`    ${improvement}`);
        });
      }
      
      if (layer.revertReason) {
        console.log(`    REVERTED: ${layer.revertReason}`);
      }
    });

    // Write output if not dry run
    if (!options.dryRun && result.finalCode !== code) {
      if (options.backup) {
        const backupPath = `${file}.backup`;
        fs.writeFileSync(backupPath, code);
        console.log(`BACKUP: Created backup at ${backupPath}`);
      }
      
      const outputFile = options.output || file;
      fs.writeFileSync(outputFile, result.finalCode);
      console.log(`SUCCESS: Fixed code written to ${outputFile}`);
    }

    // Show recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      console.log('\nRECOMMENDATIONS:');
      result.recommendations.forEach(rec => console.log(`  ${rec}`));
    }

    return result;

  } catch (error) {
    console.log('\nAnalysis failed');
    
    if (result && result.error) {
      console.log(`Error: ${result.error.message}`);
    }
    
    if (result && result.error && result.error.suggestions) {
      console.log('\nSuggestions:');
      result.error.suggestions.forEach(suggestion => {
        console.log(`  ${suggestion}`);
      });
    }

    throw error;
  }
}

/**
 * CLI function for recommendations
 */
async function recommendLayers(file) {
  if (!fs.existsSync(file)) {
    console.error(`ERROR: File not found: ${file}`);
    process.exit(1);
  }

  const code = fs.readFileSync(file, 'utf8');
  
  try {
    console.log('Analyzing code for optimal layer selection...');
    
    const analysis = EnhancedSmartLayerSelector.analyzeAndRecommend(code, file);
    
    console.log(`\nRECOMMENDATION REPORT for ${path.basename(file)}`);
    console.log('='.repeat(50));
    
    console.log(`\nRecommended Layers: ${analysis.recommendedLayers.join(', ')}`);
    console.log(`Confidence Level: ${(analysis.confidence * 100).toFixed(1)}%`);
    console.log(`Estimated Impact: ${analysis.estimatedImpact.level} (${analysis.estimatedImpact.estimatedFixTime})`);
    
    if (analysis.detectedIssues && analysis.detectedIssues.length > 0) {
      console.log(`\nDetected Issues (${analysis.detectedIssues.length}):`);
      
      // Group by severity
      const groupedIssues = analysis.detectedIssues.reduce((groups, issue) => {
        const severity = issue.severity || 'unknown';
        if (!groups[severity]) groups[severity] = [];
        groups[severity].push(issue);
        return groups;
      }, {});
      
      Object.entries(groupedIssues).forEach(([severity, issues]) => {
        const icon = severity === 'high' ? 'CRITICAL' : severity === 'medium' ? 'MEDIUM' : 'LOW';
        console.log(`\n  ${icon} Priority:`);
        issues.forEach(issue => {
          console.log(`    ${issue.description} (Layer ${issue.fixedByLayer})`);
        });
      });
    }

    if (analysis.reasoning && analysis.reasoning.length > 0) {
      console.log('\nReasoning:');
      analysis.reasoning.forEach(reason => console.log(`  ${reason}`));
    }

    console.log(`\nCommand: neurolint analyze ${file} -l ${analysis.recommendedLayers.join(',')} to apply fixes`);

  } catch (error) {
    console.error('Recommendation failed:', error.message);
    throw error;
  }
}

/**
 * Upload to Supabase (if configured)
 */
async function uploadToSupabase(file) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: Supabase not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY');
    return;
  }

  if (!fs.existsSync(file)) {
    console.error(`ERROR: File not found: ${file}`);
    return;
  }

  const fileName = path.basename(file);
  const fileContent = fs.readFileSync(file, 'utf8');
  
  try {
    console.log(`Uploading ${fileName} to Supabase...`);
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Upload file content
    const { data, error: uploadError } = await supabase
      .storage
      .from('neurolint-files')
      .upload(`uploads/${fileName}`, fileContent, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('ERROR: Upload failed:', uploadError.message);
      return;
    }

    // Save file metadata
    const { error: ruleError } = await supabase
      .from('uploaded_files')
      .insert({
        filename: fileName,
        file_path: data.path,
        content_preview: fileContent.substring(0, 500),
        upload_date: new Date().toISOString()
      });

    if (ruleError) {
      console.warn('WARNING: Metadata save failed:', ruleError.message);
    }

    console.log(`SUCCESS: Successfully uploaded ${fileName}`);

  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}

/**
 * Run all layers
 */
async function runAllLayers(file, options = {}) {
  console.log('Running all layers...');
  await analyzeEnhanced(file, { ...options, layers: [1, 2, 3, 4, 5, 6] });
  console.log('SUCCESS: All layers completed');
}

/**
 * Dry run simulation
 */
async function runDryRun(file) {
  console.log('Dry run simulation...');
  await analyzeEnhanced(file, { dryRun: true, verbose: true });
  console.log('SUCCESS: Dry run completed');
}

/**
 * Run individual layer
 */
async function runLayer(file, layerNumber, options = {}) {
  if (layerNumber < 1 || layerNumber > 6) {
    console.error('ERROR: Layer number must be between 1 and 6');
    return;
  }
  
  console.log(`Running Layer ${layerNumber}...`);
  await analyzeEnhanced(file, { ...options, layers: [layerNumber] });
  console.log(`SUCCESS: Layer ${layerNumber} completed`);
}

// Export functions for use by other modules
module.exports = {
  analyzeEnhanced,
  recommendLayers,
  uploadToSupabase,
  runAllLayers,
  runDryRun,
  runLayer
};
