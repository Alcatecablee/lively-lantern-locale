#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { glob } = require('glob');

// Import the enhanced orchestrator and all components
const EnhancedNeuroLintOrchestrator = require('../enhanced-orchestrator');
const EnhancedSmartLayerSelector = require('../orchestration/enhanced-selector');

// Enterprise dark theme banner - no colors, no emojis, professional only
const banner = `
┌────────────────────────────────────────────────────────────────┐
│                        NeuroLint v1.0.0                        │
│           Enterprise Code Quality Automation System           │
└────────────────────────────────────────────────────────────────┘
`;

console.log(banner);

program
  .name('neurolint')
  .description('NeuroLint - Enterprise multi-layer automated fixing system for React/Next.js codebases')
  .version('1.0.0');

// Main fix command
program
  .command('fix')
  .description('Automatically fix code issues with intelligent layer selection')
  .argument('[target]', 'file, directory, or glob pattern to fix (default: src/)', 'src/')
  .option('-l, --layers <layers>', 'comma-separated list of layers to run (1,2,3,4,5,6)', 'auto')
  .option('-d, --dry-run', 'preview changes without applying them')
  .option('-v, --verbose', 'detailed output with analysis and timings')
  .option('-b, --backup', 'create .backup files before modifications')
  .option('--exclude <patterns>', 'exclude patterns (comma-separated globs)', 'node_modules/**,dist/**,build/**,.git/**')
  .option('--skip-layers <layers>', 'skip specific layers (comma-separated)')
  .option('--force', 'force execution even with validation warnings')
  .option('--cache', 'enable transformation caching for performance', true)
  .option('--no-ast', 'disable AST transformations (use regex only)')
  .action(async (target, options) => {
    const startTime = Date.now();
    
    try {
      console.log('Starting NeuroLint analysis...\n');
      
      // Get files to process
      const files = await getFilesToProcess(target, options.exclude);
      
      if (files.length === 0) {
        console.log('WARNING: No files found to process.');
        console.log('INFO: Try a different target path or check your exclude patterns.');
        return;
      }
      
      console.log(`FILES: Found ${files.length} files to process`);
      
      // Parse layers
      const layers = await parseLayers(options.layers, files, options);
      
      if (options.dryRun) {
        console.log('MODE: DRY RUN - No files will be modified\n');
      }
      
      // Initialize orchestrator
      const orchestrator = new EnhancedNeuroLintOrchestrator({
        verbose: options.verbose,
        dryRun: options.dryRun,
        useAST: !options.noAst,
        useCache: options.cache,
        createBackups: options.backup,
        projectRoot: process.cwd()
      });
      
      let totalChanges = 0;
      let processedFiles = 0;
      let skippedFiles = 0;
      const results = [];
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileNum = i + 1;
        
        if (options.verbose) {
          console.log(`\nPROCESSING: [${fileNum}/${files.length}] ${file}`);
        } else {
          process.stdout.write(`\rPROCESSING: ${fileNum}/${files.length} files`);
        }
        
        try {
          const code = fs.readFileSync(file, 'utf8');
          const result = await orchestrator.execute(code, file, layers);
          
          if (result.summary && result.summary.totalChanges > 0) {
            if (!options.dryRun) {
              // Create backup if requested
              if (options.backup) {
                fs.writeFileSync(`${file}.backup`, code);
              }
              
              // Write transformed code
              fs.writeFileSync(file, result.finalCode);
            }
            
            totalChanges += result.summary.totalChanges;
            processedFiles++;
            
            if (options.verbose) {
              console.log(`SUCCESS: Applied ${result.summary.totalChanges} changes`);
              if (result.layerResults) {
                result.layerResults.forEach(layer => {
                  if (layer.improvements && layer.improvements.length > 0) {
                    console.log(`  Layer ${layer.layerId}: ${layer.improvements.join(', ')}`);
                  }
                });
              }
            }
          } else {
            skippedFiles++;
            if (options.verbose) {
              console.log('INFO: No changes needed');
            }
          }
          
          results.push({ file, result });
          
        } catch (error) {
          console.log(`\nERROR: Processing ${file}: ${error.message}`);
          if (options.verbose) {
            console.log(`STACK: ${error.stack}`);
          }
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

// Individual layer commands
for (let i = 1; i <= 6; i++) {
  program
    .command(`layer-${i}`)
    .description(`Run only Layer ${i}`)
    .argument('[target]', 'file or directory to fix', 'src/')
    .option('-d, --dry-run', 'preview changes without applying them')
    .option('-v, --verbose', 'verbose output')
    .option('-b, --backup', 'create backup files')
    .action(async (target, options) => {
      // Reuse fix command logic but with specific layer
      const fixCommand = program.commands.find(cmd => cmd.name() === 'fix');
      await fixCommand._actionHandler(target, { 
        ...options, 
        layers: i.toString() 
      });
    });
}

// Analyze command
program
  .command('analyze')
  .description('Analyze code and recommend appropriate layers without making changes')
  .argument('[target]', 'file or directory to analyze', 'src/')
  .option('--exclude <patterns>', 'exclude patterns', 'node_modules/**,dist/**,build/**')
  .action(async (target, options) => {
    console.log('Analyzing code structure and issues...\n');
    
    const files = await getFilesToProcess(target, options.exclude);
    
    if (files.length === 0) {
      console.log('WARNING: No files found to analyze.');
      return;
    }
    
    const allIssues = [];
    const layerRecommendations = new Map();
    
    for (const file of files.slice(0, 10)) { // Analyze first 10 files for performance
      try {
        const code = fs.readFileSync(file, 'utf8');
        const analysis = EnhancedSmartLayerSelector.analyzeAndRecommend(code, file);
        
        if (analysis.detectedIssues && analysis.detectedIssues.length > 0) {
          console.log(`FILE: ${file}:`);
          analysis.detectedIssues.forEach(issue => {
            const severity = getSeverityText(issue.severity);
            console.log(`  ${severity}: ${issue.description} (Layer ${issue.fixedByLayer})`);
          });
          
          allIssues.push(...analysis.detectedIssues);
          if (analysis.recommendedLayers) {
            analysis.recommendedLayers.forEach(layer => {
              layerRecommendations.set(layer, (layerRecommendations.get(layer) || 0) + 1);
            });
          }
        }
      } catch (error) {
        console.log(`ERROR: Analyzing ${file}: ${error.message}`);
      }
    }
    
    if (allIssues.length === 0) {
      console.log('\nSUCCESS: No issues detected. Code quality looks good.');
      return;
    }
    
    console.log('\nANALYSIS SUMMARY:');
    console.log(`  Total issues: ${allIssues.length}`);
    console.log(`  Critical: ${allIssues.filter(i => i.severity === 'high').length}`);
    console.log(`  Medium: ${allIssues.filter(i => i.severity === 'medium').length}`);
    console.log(`  Low: ${allIssues.filter(i => i.severity === 'low').length}`);
    
    console.log('\nRECOMMENDED COMMAND:');
    const recommendedLayers = Array.from(layerRecommendations.keys()).sort();
    console.log(`  neurolint fix ${target} --layers ${recommendedLayers.join(',')}`);
  });

// Config command
program
  .command('config')
  .description('Configure NeuroLint settings and preferences')
  .option('--init', 'create default configuration file')
  .option('--show', 'show current configuration')
  .action(async (options) => {
    const configPath = path.join(process.cwd(), '.neurolint.json');
    
    if (options.init) {
      const defaultConfig = {
        layers: [1, 2, 3, 4],
        excludePatterns: ["node_modules/**", "dist/**", "build/**", ".git/**"],
        createBackups: true,
        useAST: true,
        useCache: true,
        verbose: false
      };
      
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log(`SUCCESS: Created configuration file: ${configPath}`);
    }
    
    if (options.show) {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('CURRENT CONFIGURATION:');
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log('WARNING: No configuration file found. Use --init to create one.');
      }
    }
  });

// Test command
program
  .command('test')
  .description('Run NeuroLint test suite to verify functionality')
  .option('-v, --verbose', 'verbose test output')
  .action(async (options) => {
    console.log('Running NeuroLint test suite...\n');
    
    try {
      const TestSuite = require('../test');
      const tester = new TestSuite();
      const results = await tester.runTestSuite();
      
      console.log('TEST RESULTS:');
      console.log(`  Total: ${results.summary.total}`);
      console.log(`  Passed: ${results.summary.passed}`);
      console.log(`  Failed: ${results.summary.failed}`);
      console.log(`  Pass Rate: ${results.summary.passRate.toFixed(1)}%`);
      
      if (results.failedTests.length > 0) {
        console.log('\nFAILED TESTS:');
        results.failedTests.forEach(test => {
          console.log(`  ${test.name}: ${test.error || 'Unknown error'}`);
        });
      }
      
      results.recommendations.forEach(rec => {
        console.log(`\n${rec}`);
      });
      
    } catch (error) {
      console.error(`TEST SUITE ERROR: ${error.message}`);
      process.exit(1);
    }
  });

// Helper functions
async function getFilesToProcess(target, excludePatterns = '') {
  const excludeArray = excludePatterns.split(',').map(p => p.trim()).filter(Boolean);
  
  // If target is a file, return it directly
  if (fs.existsSync(target) && fs.statSync(target).isFile()) {
    return [target];
  }
  
  // Otherwise, glob for supported file types
  const patterns = [
    path.join(target, '**/*.{ts,tsx,js,jsx,json}'),
    path.join(target, '*.{ts,tsx,js,jsx,json}')
  ];
  
  const files = [];
  for (const pattern of patterns) {
    try {
      const matches = await glob(pattern, { 
        ignore: excludeArray,
        absolute: false 
      });
      files.push(...matches);
    } catch (error) {
      console.log(`WARNING: Glob pattern failed: ${pattern}`);
    }
  }
  
  // Remove duplicates and sort
  return [...new Set(files)].sort();
}

async function parseLayers(layerString, files, options) {
  if (layerString === 'auto') {
    console.log('MODE: Auto-detecting optimal layers...');
    
    // Sample a few files for analysis
    const sampleFiles = files.slice(0, Math.min(5, files.length));
    const allRecommendations = new Set();
    
    for (const file of sampleFiles) {
      try {
        const code = fs.readFileSync(file, 'utf8');
        const analysis = EnhancedSmartLayerSelector.analyzeAndRecommend(code, file);
        if (analysis.recommendedLayers) {
          analysis.recommendedLayers.forEach(layer => allRecommendations.add(layer));
        }
      } catch (error) {
        // Skip files that can't be analyzed
      }
    }
    
    const autoLayers = Array.from(allRecommendations).sort();
    
    if (autoLayers.length === 0) {
      console.log('INFO: No specific issues detected, using default layers [1,2,3,4]');
      return [1, 2, 3, 4];
    }
    
    console.log(`LAYERS: Selected layers: ${autoLayers.join(', ')}`);
    return autoLayers;
  }
  
  const layers = layerString.split(',').map(l => parseInt(l.trim())).filter(l => l >= 1 && l <= 6);
  
  if (options.skipLayers) {
    const skipLayers = options.skipLayers.split(',').map(l => parseInt(l.trim()));
    return layers.filter(l => !skipLayers.includes(l));
  }
  
  console.log(`LAYERS: Running layers: ${layers.join(', ')}`);
  return layers;
}

function getSeverityText(severity) {
  switch (severity) {
    case 'high': return 'CRITICAL';
    case 'medium': return 'MEDIUM';
    case 'low': return 'LOW';
    default: return 'INFO';
  }
}

// Error handling
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

// Parse command line arguments
program.parse();

module.exports = program;