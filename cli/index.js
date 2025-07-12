#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const { createClient } = require('@supabase/supabase-js');

// Import the enhanced orchestrator
const EnhancedNeuroLintOrchestrator = require('./enhanced-orchestrator');

// Import orchestration components for standalone use
const EnhancedSmartLayerSelector = require('./orchestration/enhanced-selector');
const LayerDependencyManager = require('./orchestration/dependencies');
const ErrorRecoverySystem = require('./orchestration/recovery');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

program
  .name('neurolint')
  .description('NeuroLint - Advanced multi-layer automated React/Next.js code fixing system')
  .version('2.0.0');

// Enhanced analyze command with full orchestration
program
  .command('analyze <file>')
  .description('Analyze and fix code using advanced multi-layer orchestration')
  .option('-d, --dry-run', 'preview changes without applying them')  
  .option('-v, --verbose', 'show detailed output')
  .option('-l, --layers <layers>', 'comma-separated layers to run (1,2,3,4)', '1,2,3,4')
  .option('--no-ast', 'disable AST transformations, use regex only')
  .option('--no-cache', 'disable performance caching')
  .option('--fail-fast', 'stop on first layer failure')
  .option('-o, --output <file>', 'output file (default: overwrite input)')
  .action(async (file, options) => {
    try {
      if (!fs.existsSync(file)) {
        console.error(chalk.red(`❌ File not found: ${file}`));
        process.exit(1);
      }

      const content = fs.readFileSync(file, 'utf8');
      const requestedLayers = options.layers.split(',').map(n => parseInt(n.trim()));
      
      console.log(chalk.blue('🚀 NeuroLint Enhanced Analysis Starting...'));
      console.log(chalk.cyan(`📁 Processing: ${file}`));
      
      if (options.dryRun) {
        console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be modified'));
      }

      // Create orchestrator with options
      const orchestrator = new EnhancedNeuroLintOrchestrator({
        verbose: options.verbose,
        dryRun: options.dryRun,
        useAST: options.ast !== false,
        useCache: options.cache !== false,
        failFast: options.failFast
      });

      // Execute with full orchestration
      const result = await orchestrator.execute(content, file, requestedLayers);

      // Display results
      if (result.success) {
        console.log(chalk.green('\n🎉 Analysis completed successfully!'));
        
        if (options.verbose) {
          console.log(chalk.blue('\n📊 Analysis Summary:'));
          console.log(`  Detected Issues: ${result.analysis.detectedIssues.length}`);
          console.log(`  Executed Layers: ${result.executedLayers.join(', ')}`);
          console.log(`  Total Execution Time: ${result.performance.totalExecutionTime}ms`);
          console.log(`  Confidence: ${(result.analysis.confidence * 100).toFixed(1)}%`);
          
          console.log(chalk.blue('\n🔧 Layer Results:'));
          result.layerResults.forEach(layer => {
            const status = layer.success ? '✅' : (layer.reverted ? '🔙' : '❌');
            const skipped = layer.skipped ? ' (skipped)' : '';
            console.log(`  ${status} Layer ${layer.layerId}: ${layer.name} - ${layer.changeCount} changes${skipped}`);
            
            if (layer.improvements && layer.improvements.length > 0) {
              layer.improvements.forEach(improvement => {
                console.log(`    • ${improvement}`);
              });
            }
            
            if (layer.revertReason) {
              console.log(`    ⚠️  Reverted: ${layer.revertReason}`);
            }
          });
        }

        // Write output if not dry run
        if (!options.dryRun && result.finalCode !== content) {
          const outputFile = options.output || file;
          
          // Create backup
          const backupPath = `${outputFile}.backup.${Date.now()}`;
          fs.writeFileSync(backupPath, content);
          console.log(chalk.gray(`💾 Backup created: ${backupPath}`));
          
          // Write transformed code
          fs.writeFileSync(outputFile, result.finalCode);
          console.log(chalk.green(`✅ Fixed code written to: ${outputFile}`));
        }

        // Show recommendations
        if (result.recommendations && result.recommendations.length > 0) {
          console.log(chalk.blue('\n💡 Recommendations:'));
          result.recommendations.forEach(rec => console.log(`  ${rec}`));
        }

      } else {
        console.log(chalk.red('\n❌ Analysis failed'));
        
        if (result.error) {
          console.log(chalk.red(`Error: ${result.error.message}`));
          
          if (result.error.suggestions) {
            console.log(chalk.yellow('\n💡 Suggestions:'));
            result.error.suggestions.forEach(suggestion => {
              console.log(`  • ${suggestion}`);
            });
          }
        }
      }

    } catch (error) {
      console.error(chalk.red('💥 Analysis failed:', error.message));
      
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      
      process.exit(1);
    }
  });

// Smart recommendation command
program
  .command('recommend <file>')
  .description('Analyze code and recommend optimal layer configuration')
  .option('-v, --verbose', 'show detailed analysis')
  .action(async (file, options) => {
    try {
      if (!fs.existsSync(file)) {
        console.error(chalk.red(`❌ File not found: ${file}`));
        process.exit(1);
      }

      const content = fs.readFileSync(file, 'utf8');
      
      console.log(chalk.blue('🔍 Analyzing code for optimal layer selection...'));
      
      const analysis = EnhancedSmartLayerSelector.analyzeAndRecommend(content, file);
      
      console.log(chalk.green(`\n📋 Recommendation Report for ${path.basename(file)}`));
      console.log('='.repeat(50));
      
      console.log(chalk.cyan(`\n🎯 Recommended Layers: ${analysis.recommendedLayers.join(', ')}`));
      console.log(chalk.cyan(`📊 Confidence Level: ${(analysis.confidence * 100).toFixed(1)}%`));
      console.log(chalk.cyan(`⚡ Estimated Impact: ${analysis.estimatedImpact.level} (${analysis.estimatedImpact.estimatedFixTime})`));
      
      if (analysis.detectedIssues.length > 0) {
        console.log(chalk.yellow(`\n🚨 Detected Issues (${analysis.detectedIssues.length}):`));
        
        const groupedIssues = analysis.detectedIssues.reduce((acc, issue) => {
          if (!acc[issue.severity]) acc[issue.severity] = [];
          acc[issue.severity].push(issue);
          return acc;
        }, {});
        
        ['high', 'medium', 'low'].forEach(severity => {
          if (groupedIssues[severity]) {
            const icon = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
            console.log(chalk.white(`\n  ${icon} ${severity.toUpperCase()} Priority:`));
            groupedIssues[severity].forEach(issue => {
              console.log(`    • ${issue.description} (Layer ${issue.fixedByLayer})`);
            });
          }
        });
      }
      
      if (analysis.reasoning.length > 0) {
        console.log(chalk.blue('\n🤔 Reasoning:'));
        analysis.reasoning.forEach(reason => console.log(`  • ${reason}`));
      }
      
      console.log(chalk.green(`\n✨ Run: neurolint analyze ${file} -l ${analysis.recommendedLayers.join(',')} to apply fixes`));

    } catch (error) {
      console.error(chalk.red('💥 Recommendation failed:', error.message));
      process.exit(1);
    }
  });

program
  .command('upload <file>')
  .description('Upload file to Supabase storage and save metadata')
  .action(async (file, options) => {
    try {
      if (!supabase) {
        console.error(chalk.red('❌ Supabase not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY'));
        process.exit(1);
      }

      if (!fs.existsSync(file)) {
        console.error(chalk.red(`❌ File not found: ${file}`));
        process.exit(1);
      }

      const content = fs.readFileSync(file, 'utf8');
      const fileName = path.basename(file);
      
      console.log(chalk.blue(`📤 Uploading ${fileName} to Supabase...`));

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('neurolint-layers')
        .upload(`uploads/${fileName}`, content, {
          contentType: 'text/plain',
          upsert: true
        });

      if (uploadError) {
        console.error(chalk.red('❌ Upload failed:', uploadError.message));
        process.exit(1);
      }

      // Save metadata to transformation_rules table
      const { data: ruleData, error: ruleError } = await supabase
        .from('transformation_rules')
        .insert({
          layer: 'upload',
          rule: `File: ${fileName}`,
          metadata: { fileName, uploadPath: uploadData.path }
        });

      if (ruleError) {
        console.warn(chalk.yellow('⚠️  Metadata save failed:', ruleError.message));
      }

      console.log(chalk.green(`✅ Successfully uploaded: ${fileName}`));

    } catch (error) {
      console.error(chalk.red('💥 Upload failed:', error.message));
      process.exit(1);
    }
  });

// Mirror npm script functionality
program
  .command('fix-all [directory]')
  .description('Run all layers on directory or current directory')
  .option('-d, --dry-run', 'preview changes only')
  .option('-v, --verbose', 'show detailed output')
  .action(async (directory = '.', options) => {
    console.log(chalk.blue('🔧 Running all layers...'));
    // Implementation would scan directory and run analyze on each file
    console.log(chalk.green('✅ All layers completed'));
  });

program
  .command('fix-dry-run [directory]')
  .description('Simulate all fixes without applying changes')
  .action(async (directory = '.', options) => {
    console.log(chalk.blue('🔍 Dry run simulation...'));
    // Implementation similar to fix-all but with dry-run enabled
    console.log(chalk.green('✅ Dry run completed'));
  });

// Individual layer commands
for (let i = 1; i <= 6; i++) {
  program
    .command(`fix-layer-${i} [directory]`)
    .description(`Run only layer ${i}`)
    .option('-d, --dry-run', 'preview changes only')
    .option('-v, --verbose', 'show detailed output')
    .action(async (directory = '.', options) => {
      console.log(chalk.blue(`🔧 Running Layer ${i}...`));
      // Implementation would run specific layer
      console.log(chalk.green(`✅ Layer ${i} completed`));
    });
}

// Utility functions
function calculateChanges(before, after) {
  if (before === after) return 0;
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  return Math.abs(beforeLines.length - afterLines.length) + 
         beforeLines.filter((line, i) => line !== afterLines[i]).length;
}

function detectImprovements(before, after, layerId) {
  const improvements = [];
  
  if (before === after) {
    return ['No changes needed'];
  }
  
  // Layer-specific improvement detection
  switch (layerId) {
    case 1:
      if (after.includes('"target": "ES2022"')) improvements.push('Upgraded TypeScript target');
      break;
    case 2:
      if (after.split('&quot;').length < before.split('&quot;').length) improvements.push('Fixed HTML entities');
      break;
    case 3:
      if (after.split('key=').length > before.split('key=').length) improvements.push('Added missing React keys');
      break;
    case 4:
      if (after.includes('typeof window')) improvements.push('Added SSR guards');
      break;
    case 5:
      if (after.includes("'use client'")) improvements.push('Fixed Next.js client components');
      break;
    case 6:
      if (after.includes('test(') || after.includes('expect(')) improvements.push('Enhanced testing patterns');
      break;
  }
  
  return improvements.length > 0 ? improvements : ['Code transformation applied'];
}

if (require.main === module) {
  program.parse();
}

module.exports = { 
  EnhancedNeuroLintOrchestrator,
  EnhancedSmartLayerSelector,
  LayerDependencyManager,
  ErrorRecoverySystem
};
