#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const { glob } = require('glob');

// Import the enhanced orchestrator and all components
const EnhancedNeuroLintOrchestrator = require('../enhanced-orchestrator');
const TransformationValidator = require('../orchestration/validator');
const EnhancedSmartLayerSelector = require('../orchestration/enhanced-selector');

// ASCII Art Banner
const banner = `
${chalk.cyan('╔══════════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}                    ${chalk.bold.yellow('🧠 NeuroLint')} ${chalk.cyan('v1.0.0')}                    ${chalk.cyan('║')}
${chalk.cyan('║')}         ${chalk.gray('Multi-Layer Automated Code Fixing System')}         ${chalk.cyan('║')}
${chalk.cyan('╚══════════════════════════════════════════════════════════════╝')}
`;

console.log(banner);

program
  .name('neurolint')
  .description('NeuroLint - Multi-layer automated fixing system for React/Next.js codebases')
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
      console.log(chalk.blue('🚀 Starting NeuroLint analysis...\n'));
      
      // Get files to process
      const files = await getFilesToProcess(target, options.exclude);
      
      if (files.length === 0) {
        console.log(chalk.yellow('⚠️  No files found to process.'));
        console.log(chalk.gray('   Try a different target path or check your exclude patterns.'));
        return;
      }
      
      console.log(chalk.cyan(`📁 Found ${files.length} files to process`));
      
      // Parse layers
      const layers = await parseLayers(options.layers, files, options);
      
      if (options.dryRun) {
        console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be modified\n'));
      }
      
      // Initialize orchestrator
      const orchestrator = new EnhancedNeuroLintOrchestrator({
        verbose: options.verbose,
        dryRun: options.dryRun,
        useAST: !options.noAst,
        useCache: options.cache,
        createBackups: options.backup
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
          console.log(chalk.gray(`\n[${fileNum}/${files.length}] Processing: ${file}`));
        } else {
          process.stdout.write(`\r${chalk.blue('Processing:')} ${fileNum}/${files.length} files`);
        }
        
        try {
          const code = fs.readFileSync(file, 'utf8');
          const result = await orchestrator.execute(code, file, layers);
          
          if (result.summary.totalChanges > 0) {
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
              console.log(chalk.green(`  ✅ Applied ${result.summary.totalChanges} changes`));
              result.layerResults.forEach(layer => {
                if (layer.improvements && layer.improvements.length > 0) {
                  console.log(chalk.gray(`     Layer ${layer.layerId}: ${layer.improvements.join(', ')}`));
                }
              });
            }
          } else {
            skippedFiles++;
            if (options.verbose) {
              console.log(chalk.gray('  ⏭️  No changes needed'));
            }
          }
          
          results.push({ file, result });
          
        } catch (error) {
          console.log(chalk.red(`\n❌ Error processing ${file}: ${error.message}`));
          if (options.verbose) {
            console.log(chalk.gray(error.stack));
          }
        }
      }
      
      // Final summary
      const totalTime = Date.now() - startTime;
      console.log('\n');
      console.log(chalk.green('🎉 NeuroLint processing complete!\n'));
      
      console.log(chalk.cyan('📊 Summary:'));
      console.log(`   Files processed: ${chalk.bold(processedFiles)}`);
      console.log(`   Files skipped: ${chalk.gray(skippedFiles)}`);
      console.log(`   Total changes: ${chalk.bold.green(totalChanges)}`);
      console.log(`   Execution time: ${chalk.gray((totalTime / 1000).toFixed(2))}s`);
      
      if (options.dryRun && totalChanges > 0) {
        console.log(chalk.yellow('\n💡 Run without --dry-run to apply these changes'));
      }
      
    } catch (error) {
      console.error(chalk.red(`\n❌ Fatal error: ${error.message}`));
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
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
    console.log(chalk.blue('🔍 Analyzing code structure and issues...\n'));
    
    const files = await getFilesToProcess(target, options.exclude);
    
    if (files.length === 0) {
      console.log(chalk.yellow('⚠️  No files found to analyze.'));
      return;
    }
    
    const allIssues = [];
    const layerRecommendations = new Map();
    
    for (const file of files.slice(0, 10)) { // Analyze first 10 files for performance
      try {
        const code = fs.readFileSync(file, 'utf8');
        const analysis = EnhancedSmartLayerSelector.analyzeAndRecommend(code, file);
        
        if (analysis.detectedIssues.length > 0) {
          console.log(chalk.gray(`📄 ${file}:`));
          analysis.detectedIssues.forEach(issue => {
            console.log(`   ${getSeverityIcon(issue.severity)} ${issue.description} ${chalk.gray(`(Layer ${issue.fixedByLayer})`)}`);
          });
          
          allIssues.push(...analysis.detectedIssues);
          analysis.recommendedLayers.forEach(layer => {
            layerRecommendations.set(layer, (layerRecommendations.get(layer) || 0) + 1);
          });
        }
      } catch (error) {
        console.log(chalk.red(`❌ Error analyzing ${file}: ${error.message}`));
      }
    }
    
    if (allIssues.length === 0) {
      console.log(chalk.green('\n✅ No issues detected! Your code looks great.'));
      return;
    }
    
    console.log(chalk.cyan('\n📊 Analysis Summary:'));
    console.log(`   Total issues: ${allIssues.length}`);
    console.log(`   Critical: ${allIssues.filter(i => i.severity === 'high').length}`);
    console.log(`   Medium: ${allIssues.filter(i => i.severity === 'medium').length}`);
    console.log(`   Low: ${allIssues.filter(i => i.severity === 'low').length}`);
    
    console.log(chalk.cyan('\n🎯 Recommended command:'));
    const recommendedLayers = Array.from(layerRecommendations.keys()).sort();
    console.log(chalk.green(`   neurolint fix ${target} --layers ${recommendedLayers.join(',')}`));
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
      console.log(chalk.green(`✅ Created configuration file: ${configPath}`));
    }
    
    if (options.show) {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(chalk.cyan('📋 Current configuration:'));
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log(chalk.yellow('⚠️  No configuration file found. Use --init to create one.'));
      }
    }
  });

// Test command
program
  .command('test')
  .description('Run NeuroLint test suite to verify functionality')
  .option('-v, --verbose', 'verbose test output')
  .action(async (options) => {
    console.log(chalk.blue('🧪 Running NeuroLint test suite...\n'));
    
    try {
      const TestSuite = require('../test');
      const tester = new TestSuite();
      const results = await tester.runTestSuite();
      
      console.log(chalk.cyan('📊 Test Results:'));
      console.log(`   Total: ${results.summary.total}`);
      console.log(`   Passed: ${chalk.green(results.summary.passed)}`);
      console.log(`   Failed: ${chalk.red(results.summary.failed)}`);
      console.log(`   Pass Rate: ${results.summary.passRate.toFixed(1)}%`);
      
      if (results.failedTests.length > 0) {
        console.log(chalk.red('\n❌ Failed Tests:'));
        results.failedTests.forEach(test => {
          console.log(`   ${test.name}: ${test.error || 'Unknown error'}`);
        });
      }
      
      results.recommendations.forEach(rec => {
        console.log(`\n${rec}`);
      });
      
    } catch (error) {
      console.error(chalk.red(`❌ Test suite error: ${error.message}`));
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
    const matches = await glob(pattern, { 
      ignore: excludeArray,
      absolute: false 
    });
    files.push(...matches);
  }
  
  // Remove duplicates and sort
  return [...new Set(files)].sort();
}

async function parseLayers(layerString, files, options) {
  if (layerString === 'auto') {
    console.log(chalk.yellow('🤖 Auto-detecting optimal layers...'));
    
    // Sample a few files for analysis
    const sampleFiles = files.slice(0, Math.min(5, files.length));
    const allRecommendations = new Set();
    
    for (const file of sampleFiles) {
      try {
        const code = fs.readFileSync(file, 'utf8');
        const analysis = EnhancedSmartLayerSelector.analyzeAndRecommend(code, file);
        analysis.recommendedLayers.forEach(layer => allRecommendations.add(layer));
      } catch (error) {
        // Skip files that can't be analyzed
      }
    }
    
    const autoLayers = Array.from(allRecommendations).sort();
    
    if (autoLayers.length === 0) {
      console.log(chalk.gray('   No specific issues detected, using default layers [1,2,3,4]'));
      return [1, 2, 3, 4];
    }
    
    console.log(chalk.green(`   Selected layers: ${autoLayers.join(', ')}`));
    return autoLayers;
  }
  
  const layers = layerString.split(',').map(l => parseInt(l.trim())).filter(l => l >= 1 && l <= 6);
  
  if (options.skipLayers) {
    const skipLayers = options.skipLayers.split(',').map(l => parseInt(l.trim()));
    return layers.filter(l => !skipLayers.includes(l));
  }
  
  console.log(chalk.cyan(`🔧 Running layers: ${layers.join(', ')}`));
  return layers;
}

function getSeverityIcon(severity) {
  switch (severity) {
    case 'high': return '🔴';
    case 'medium': return '🟠';
    case 'low': return '🟡';
    default: return '🔵';
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n💥 Uncaught Exception:'), error.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('\n💥 Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();

module.exports = program;