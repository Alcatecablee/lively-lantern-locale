#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Enhanced NeuroLint Orchestrator
const EnhancedNeuroLintOrchestrator = require('../enhanced-orchestrator');
const EnhancedSmartLayerSelector = require('../orchestration/enhanced-selector');
const LayerIntegrator = require('../layer-integrator');

// Enterprise banner - minimal professional style
const banner = `
NeuroLint Enterprise CLI v1.0.0
Enterprise Code Quality Automation System
`;

console.log(banner);

program
  .name('neurolint')
  .description('NeuroLint - Enterprise multi-layer automated fixing system for React/Next.js codebases')
  .version('1.0.0');

// Main analyze command
program
  .command('fix <target>')
  .description('Fix code using multi-layer orchestration patterns')
  .option('-d, --dry-run', 'Preview changes without applying them')
  .option('-v, --verbose', 'Show detailed output')
  .option('-l, --layers <layers>', 'Comma-separated layers to run (1,2,3,4,5,6)', '1,2,3,4')
  .option('--exclude <patterns>', 'Exclude file patterns (comma-separated)')
  .option('--backup', 'Create backup files before modifying')
  .option('-o, --output <file>', 'Output directory for fixed files')
  .action(async (target, options) => {
    try {
      console.log('Starting NeuroLint analysis...\n');

      // Get files to process
      const files = await getFilesToProcess(target, options.exclude);
      
      if (files.length === 0) {
        console.log('WARNING: No files found to process.');
        console.log('INFO: Try a different target path or check your exclude patterns.');
        process.exit(0);
      }

      console.log(`FILES: Found ${files.length} files to process`);
      
      // Parse layers
      const layers = await parseLayers(options.layers, files, options);
      
      if (options.dryRun) {
        console.log('MODE: DRY RUN - No files will be modified\n');
      }

      // Initialize orchestrator
      const orchestrator = new EnhancedNeuroLintOrchestrator({
        verbose: options.verbose || false,
        dryRun: options.dryRun || false,
        useAST: true,
        useCache: true,
        createBackups: options.backup || false
      });

      let processedFiles = 0;
      let skippedFiles = 0;
      let totalChanges = 0;
      const startTime = Date.now();

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileNum = i + 1;
        
        try {
          console.log(`\nPROCESSING: [${fileNum}/${files.length}] ${file}`);
          
          const code = fs.readFileSync(file, 'utf8');
          
          // Execute orchestrator
          const result = await orchestrator.execute(code, file, layers);
          
          if (result.success) {
            // Write output if not dry run
            if (!options.dryRun && result.finalCode !== code) {
              const outputFile = options.output ? 
                path.join(options.output, path.basename(file)) : file;
              
              // Create backup if requested
              if (options.backup) {
                const backupPath = `${outputFile}.backup`;
                fs.writeFileSync(backupPath, code);
              }
              
              fs.writeFileSync(outputFile, result.finalCode);
            }
            
            // Count changes
            const changes = result.summary?.totalChanges || 0;
            totalChanges += changes;
            
            if (changes > 0) {
              console.log(`SUCCESS: Applied ${result.summary.totalChanges} changes`);
              
              // Show layer improvements
              if (result.layerResults && options.verbose) {
                result.layerResults.forEach(layer => {
                  if (layer.improvements && layer.improvements.length > 0) {
                    console.log(`  Layer ${layer.layerId}: ${layer.improvements.join(', ')}`);
                  }
                });
              }
              
              processedFiles++;
            } else {
              console.log('INFO: No changes needed');
              skippedFiles++;
            }
            
          } else {
            console.log(`ERROR: ${result.error?.message || 'Unknown error'}`);
            skippedFiles++;
          }
          
        } catch (error) {
          console.log(`\nERROR: Processing ${file}: ${error.message}`);
          if (options.verbose) {
            console.log(`STACK: ${error.stack}`);
          }
          skippedFiles++;
        }
      }

      // Final summary
      const totalTime = Date.now() - startTime;
      console.log('\n');
      console.log('NeuroLint processing complete.\n');
      
      console.log('SUMMARY:');
      console.log(`  Files processed: ${processedFiles}`);
      console.log(`  Files skipped: ${skippedFiles}`);
      console.log(`  Total changes: ${totalChanges}`);
      console.log(`  Execution time: ${(totalTime / 1000).toFixed(2)}s`);
      
      if (options.dryRun && totalChanges > 0) {
        console.log('\nINFO: Run without --dry-run to apply these changes');
      }

    } catch (error) {
      console.error(`\nFATAL ERROR: ${error.message}`);
      if (options.verbose) {
        console.error(`STACK: ${error.stack}`);
      }
      process.exit(1);
    }
  });

// Analyze command
program
  .command('analyze <target>')
  .description('Analyze code and recommend optimal layer configuration')
  .option('--exclude <patterns>', 'Exclude file patterns (comma-separated)')
  .option('-v, --verbose', 'Show detailed analysis')
  .action(async (target, options) => {
    try {
      console.log('Analyzing code structure and issues...\n');

      const files = await getFilesToProcess(target, options.exclude);
      
      if (files.length === 0) {
        console.log('WARNING: No files found to analyze.');
        return;
      }

      const allIssues = [];
      const recommendedLayers = new Set();

      // Analyze each file
      for (const file of files) {
        try {
          const code = fs.readFileSync(file, 'utf8');
          const analysis = EnhancedSmartLayerSelector.analyzeAndRecommend(code, file);
          
          console.log(`FILE: ${file}:`);
          analysis.detectedIssues.forEach(issue => {
            allIssues.push(issue);
            const severity = getSeverityText(issue.severity);
            console.log(`  ${severity}: ${issue.description} (Layer ${issue.fixedByLayer})`);
          });
          
          analysis.recommendedLayers.forEach(layer => recommendedLayers.add(layer));
          
        } catch (error) {
          console.log(`ERROR: Analyzing ${file}: ${error.message}`);
        }
      }

      if (allIssues.length === 0) {
        console.log('\nSUCCESS: No issues detected. Code quality looks good.');
        return;
      }

      // Summary
      console.log('\nANALYSIS SUMMARY:');
      console.log(`  Total issues: ${allIssues.length}`);
      console.log(`  Critical: ${allIssues.filter(i => i.severity === 'high').length}`);
      console.log(`  Medium: ${allIssues.filter(i => i.severity === 'medium').length}`);
      console.log(`  Low: ${allIssues.filter(i => i.severity === 'low').length}`);

      console.log('\nRECOMMENDED COMMAND:');
      const recommendedLayersList = Array.from(recommendedLayers).sort();
      console.log(`  neurolint fix ${target} --layers ${recommendedLayersList.join(',')}`);

    } catch (error) {
      console.error(`ERROR: ${error.message}`);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Manage NeuroLint configuration')
  .option('--init', 'Create default configuration file')
  .action(async (options) => {
    try {
      const configPath = path.join(process.cwd(), 'neurolint.config.js');
      
      if (options.init) {
        const defaultConfig = {
          layers: [1, 2, 3, 4],
          exclude: ['node_modules/**', '*.min.js', 'dist/**'],
          backup: true,
          verbose: false
        };
        
        fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(defaultConfig, null, 2)};`);
        console.log(`SUCCESS: Created configuration file: ${configPath}`);
      } else {
        if (fs.existsSync(configPath)) {
          const config = require(configPath);
          console.log('CURRENT CONFIGURATION:');
          console.log(JSON.stringify(config, null, 2));
        } else {
          console.log('WARNING: No configuration file found. Use --init to create one.');
        }
      }
    } catch (error) {
      console.error(`ERROR: ${error.message}`);
    }
  });

// Test command
program
  .command('test')
  .description('Run NeuroLint test suite')
  .action(async () => {
    try {
      console.log('Running NeuroLint test suite...\n');
      
      const { runTests } = require('../test');
      const results = await runTests();
      
      console.log('TEST RESULTS:');
      console.log(`  Total: ${results.summary.total}`);
      console.log(`  Passed: ${results.summary.passed}`);
      console.log(`  Failed: ${results.summary.failed}`);
      console.log(`  Pass Rate: ${results.summary.passRate.toFixed(1)}%`);
      
      if (results.failures.length > 0) {
        console.log('\nFAILED TESTS:');
        results.failures.forEach(test => {
          console.log(`  ${test.name}: ${test.error || 'Unknown error'}`);
        });
      }
      
      if (results.recommendations && results.recommendations.length > 0) {
        console.log('\nRECOMMENDATIONS:');
        results.recommendations.forEach(rec => {
          console.log(`\n${rec}`);
        });
      }

    } catch (error) {
      console.error(`TEST SUITE ERROR: ${error.message}`);
      process.exit(1);
    }
  });

// Individual layer commands
for (let i = 1; i <= 6; i++) {
  program
    .command(`layer-${i} <target>`)
    .description(`Run only Layer ${i}`)
    .option('-d, --dry-run', 'Preview changes only')
    .option('-v, --verbose', 'Show detailed output')
    .option('--exclude <patterns>', 'Exclude file patterns')
    .action(async (target, options) => {
      await program.commands.find(cmd => cmd.name() === 'fix').action(target, {
        ...options,
        layers: String(i)
      });
    });
}

// Utility functions
async function getFilesToProcess(target, excludePatterns = '') {
  try {
    const patterns = excludePatterns.split(',').map(p => p.trim()).filter(Boolean);
    const files = await glob(target, { 
      ignore: ['node_modules/**', '*.min.js', 'dist/**', 'build/**', ...patterns],
      nodir: true 
    });
    return files;
  } catch (error) {
    console.log(`WARNING: Glob pattern failed: ${pattern}`);
    return [];
  }
}

async function parseLayers(layerString, files, options) {
  if (layerString === 'auto') {
    console.log('MODE: Auto-detecting optimal layers...');
    
    // Auto-detect by analyzing first few files
    const sampleFiles = files.slice(0, Math.min(3, files.length));
    const detectedIssues = [];
    
    for (const file of sampleFiles) {
      try {
        const code = fs.readFileSync(file, 'utf8');
        const analysis = EnhancedSmartLayerSelector.analyzeAndRecommend(code, file);
        detectedIssues.push(...analysis.detectedIssues);
      } catch (error) {
        // Continue with other files
      }
    }
    
    if (detectedIssues.length === 0) {
      console.log('INFO: No specific issues detected, using default layers [1,2,3,4]');
      return [1, 2, 3, 4];
    }
    
    const autoLayers = [...new Set(detectedIssues.map(issue => issue.fixedByLayer))].sort();
    console.log(`LAYERS: Selected layers: ${autoLayers.join(', ')}`);
    return autoLayers;
  }
  
  const layers = layerString.split(',').map(l => parseInt(l.trim())).filter(l => l >= 1 && l <= 6);
  console.log(`LAYERS: Running layers: ${layers.join(', ')}`);
  return layers;
}

function getSeverityText(severity) {
  switch (severity) {
    case 'high': return 'CRITICAL';
    case 'medium': return 'WARNING';
    case 'low': return 'INFO';
    default: return 'UNKNOWN';
  }
}

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('\nUNCHANDLED EXCEPTION:', error.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('STACK:', error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\nUNHANDLED REJECTION:', promise, 'reason:', reason);
  process.exit(1);
});

// Parse CLI arguments
if (require.main === module) {
  program.parse();
}

module.exports = program;