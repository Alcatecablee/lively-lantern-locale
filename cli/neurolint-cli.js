#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const { glob } = require('glob');

// We'll need to compile and import your orchestrator
// For now, this is a standalone implementation

program
  .name('neurolint')
  .description('NeuroLint - Automated code fixing for React/Next.js projects')
  .version('1.0.0');

program
  .command('fix')
  .description('Fix code issues in files or directories')
  .argument('[target]', 'file or directory to fix (default: current directory)', '.')
  .option('-l, --layers <layers>', 'comma-separated list of layers to run (1,2,3,4)', '1,2,3,4')
  .option('-d, --dry-run', 'preview changes without applying them')
  .option('-v, --verbose', 'verbose output')
  .option('-b, --backup', 'create backup before fixing')
  .option('--exclude <patterns>', 'exclude patterns (comma-separated)')
  .action(async (target, options) => {
    try {
      console.log(chalk.blue('🚀 NeuroLint - Starting code analysis...'));
      
      const files = await getFilesToProcess(target, options.exclude);
      const layers = options.layers.split(',').map(l => parseInt(l.trim()));
      
      console.log(chalk.cyan(`📁 Found ${files.length} files to process`));
      console.log(chalk.cyan(`🔧 Running layers: ${layers.join(', ')}`));
      
      if (options.dryRun) {
        console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be modified'));
      }

      let totalChanges = 0;
      let processedFiles = 0;

      for (const file of files) {
        const result = await processFile(file, layers, options);
        
        if (result.changed) {
          totalChanges += result.changes;
          processedFiles++;
          
          if (options.verbose) {
            console.log(chalk.green(`✅ ${file} (${result.changes} changes)`));
            result.layers.forEach(layer => {
              if (layer.changeCount > 0) {
                console.log(chalk.gray(`   • ${layer.name}: ${layer.changeCount} changes`));
              }
            });
          }
        } else if (options.verbose) {
          console.log(chalk.gray(`⭕ ${file} (no changes needed)`));
        }
      }

      console.log(chalk.green(`\n✨ Complete! Fixed ${processedFiles} files with ${totalChanges} total changes`));

    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Run the test suite')
  .option('-v, --verbose', 'verbose output')
  .action(async (options) => {
    console.log(chalk.blue('🧪 Running NeuroLint test suite...'));
    
    // Test cases from your existing test suite
    const testCases = [
      {
        name: "TypeScript Target Upgrade",
        input: '{"compilerOptions": {"target": "es5"}}',
        expected: '"target": "ES2022"'
      },
      {
        name: "HTML Entity Fix",
        input: 'const title = &quot;Hello&quot;;',
        expected: 'const title = "Hello";'
      },
      {
        name: "Missing Key Prop",
        input: 'items.map(item => <li>{item.name}</li>)',
        expected: 'key='
      }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of testCases) {
      try {
        const result = await processCode(test.input, 'test.tsx', [1,2,3,4,5,6]);
        
        if (result.transformed.includes(test.expected)) {
          passed++;
          if (options.verbose) {
            console.log(chalk.green(`✅ ${test.name}`));
          }
        } else {
          failed++;
          console.log(chalk.red(`❌ ${test.name}`));
          if (options.verbose) {
            console.log(chalk.gray(`   Expected: ${test.expected}`));
            console.log(chalk.gray(`   Got: ${result.transformed.substring(0, 100)}...`));
          }
        }
      } catch (error) {
        failed++;
        console.log(chalk.red(`❌ ${test.name}: ${error.message}`));
      }
    }

    console.log(chalk.cyan(`\n📊 Results: ${passed}/${passed + failed} tests passed`));
    
    if (failed > 0) {
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize NeuroLint configuration')
  .action(() => {
    console.log(chalk.blue('🚀 Initializing NeuroLint...'));
    
    const config = {
      layers: [1, 2, 3, 4, 5, 6],
      exclude: [
        "node_modules/**",
        "dist/**", 
        ".next/**",
        "build/**",
        "*.min.js"
      ],
      include: [
        "src/**/*.{ts,tsx,js,jsx}",
        "*.{ts,tsx,js,jsx,json}"
      ],
      backup: true,
      verbose: false
    };
    
    fs.writeFileSync('neurolint.config.json', JSON.stringify(config, null, 2));
    console.log(chalk.green('✅ Created neurolint.config.json'));
    console.log(chalk.cyan('📖 Edit the config file to customize your settings'));
    console.log(chalk.cyan('🚀 Run "neurolint fix" to start fixing your code!'));
  });

async function getFilesToProcess(target, excludePatterns) {
  const stats = fs.statSync(target);
  
  if (stats.isFile()) {
    return [target];
  }
  
  // Default patterns
  const include = [
    '**/*.{ts,tsx,js,jsx}',
    '**/tsconfig.json',
    '**/next.config.js',
    '**/package.json'
  ];
  
  const exclude = [
    'node_modules/**',
    'dist/**',
    '.next/**',
    'build/**',
    '*.min.js',
    ...(excludePatterns ? excludePatterns.split(',') : [])
  ];

  const files = [];
  for (const pattern of include) {
    const matches = await glob(pattern, { 
      cwd: target,
      ignore: exclude 
    });
    files.push(...matches.map(f => path.join(target, f)));
  }
  
  return [...new Set(files)]; // Remove duplicates
}

async function processFile(filePath, layers, options) {
  const code = fs.readFileSync(filePath, 'utf8');
  const result = await processCode(code, filePath, layers);
  
  if (result.transformed !== code) {
    if (options.backup) {
      const backupPath = `${filePath}.neurolint-backup`;
      fs.writeFileSync(backupPath, code);
    }
    
    if (!options.dryRun) {
      fs.writeFileSync(filePath, result.transformed);
    }
    
    return {
      changed: true,
      changes: result.layers.reduce((sum, layer) => sum + layer.changeCount, 0),
      layers: result.layers
    };
  }
  
  return { changed: false, changes: 0, layers: result.layers };
}

// Simplified version of your orchestrator logic
async function processCode(code, filePath, layers = [1,2,3,4,5,6]) {
  let transformed = code;
  const results = [];
  
  // Layer 1: Configuration fixes
  if (layers.includes(1)) {
    const startTime = Date.now();
    let layerChanged = false;
    
    if (filePath.endsWith('tsconfig.json')) {
      const before = transformed;
      transformed = transformed.replace(/"target":\s*"es5"/g, '"target": "ES2022"');
      transformed = transformed.replace(/"target":\s*"ES2020"/g, '"target": "ES2022"');
      layerChanged = transformed !== before;
    }
    
    if (filePath.endsWith('next.config.js')) {
      const before = transformed;
      if (!transformed.includes('reactStrictMode: true')) {
        transformed = transformed.replace(
          'const nextConfig = {',
          'const nextConfig = {\n  reactStrictMode: true,'
        );
        layerChanged = transformed !== before;
      }
    }
    
    results.push({
      name: 'Configuration Validation',
      success: true,
      executionTime: Date.now() - startTime,
      changeCount: layerChanged ? 1 : 0,
      improvements: layerChanged ? ['Updated configuration'] : []
    });
  }
  
  // Layer 2: Pattern fixes
  if (layers.includes(2)) {
    const startTime = Date.now();
    const before = transformed;
    
    // Fix HTML entities
    transformed = transformed.replace(/&quot;/g, '"');
    transformed = transformed.replace(/&amp;/g, '&');
    transformed = transformed.replace(/&lt;/g, '<');
    transformed = transformed.replace(/&gt;/g, '>');
    
    // Fix var to const
    transformed = transformed.replace(/\bvar\s+(\w+)\s*=\s*([^;]+);/g, 'const $1 = $2;');
    
    const layerChanged = transformed !== before;
    results.push({
      name: 'Pattern & Entity Fixes',
      success: true,
      executionTime: Date.now() - startTime,
      changeCount: layerChanged ? 1 : 0,
      improvements: layerChanged ? ['Fixed HTML entities', 'Modernized var declarations'] : []
    });
  }
  
  // Layer 3: Component fixes
  if (layers.includes(3)) {
    const startTime = Date.now();
    const before = transformed;
    
    // Add missing key props (simple regex version)
    transformed = transformed.replace(
      /\.map\(\s*\([^)]+\)\s*=>\s*<(\w+)(?![^>]*key=)/g,
      '.map((item, index) => <$1 key={index}'
    );
    
    // Add missing imports
    if (transformed.includes('useState') && !transformed.includes('import') && !transformed.includes('useState')) {
      transformed = 'import { useState } from "react";\n\n' + transformed;
    }
    
    const layerChanged = transformed !== before;
    results.push({
      name: 'Component Best Practices',
      success: true,
      executionTime: Date.now() - startTime,
      changeCount: layerChanged ? 1 : 0,
      improvements: layerChanged ? ['Added missing key props', 'Added missing imports'] : []
    });
  }
  
  // Layer 4: Hydration fixes
  if (layers.includes(4)) {
    const startTime = Date.now();
    const before = transformed;
    
    // Add SSR guards for localStorage
    transformed = transformed.replace(
      /localStorage\.getItem\(/g,
      'typeof window !== "undefined" && localStorage.getItem('
    );
    
    const layerChanged = transformed !== before;
    results.push({
      name: 'Hydration & SSR Guard',
      success: true,
      executionTime: Date.now() - startTime,
      changeCount: layerChanged ? 1 : 0,
      improvements: layerChanged ? ['Added SSR guards'] : []
    });
  }
  
  return { transformed, layers: results };
}

if (require.main === module) {
  program.parse();
}

module.exports = { processCode };
