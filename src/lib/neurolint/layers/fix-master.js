// fix-master.js
/**
 * Master Automated Fixing Script
 * Comprehensive multi-layer fix strategy for React/Next.js codebases
 * 
 * Layer 1: Configuration fixes (TypeScript, Next.js, package.json)
 * Layer 2: Bulk pattern fixes (imports, types, HTML entities)
 * Layer 3: Component-specific fixes (Button variants, Tabs props, etc.)
 * Layer 4: Hydration and SSR fixes (client-side guards, theme providers)
 * Layer 5: Next.js App Router fixes
 * Layer 6: Testing and Validation Fixes
 */

import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

console.log('Starting Comprehensive Automated Fixing System');
console.log('================================================');

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  skipLayers: process.argv.includes('--skip-layers') 
    ? process.argv[process.argv.indexOf('--skip-layers') + 1]?.split(',') || [] 
    : [],
  targetDir: process.cwd()
};

// Utility functions
function log(message, level = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    'info': '[INFO]',
    'success': '[SUCCESS]',
    'warning': '[WARNING]',
    'error': '[ERROR]',
    'debug': '[DEBUG]'
  }[level] || '[INFO]';

  console.log(`${prefix} [${timestamp}] ${message}`);
}

function runCommand(command, description) {
  try {
    log(`Running: ${description}`, 'info');
    if (!config.dryRun) {
      const result = execSync(command, { 
        cwd: config.targetDir, 
        encoding: 'utf8',
        stdio: config.verbose ? 'inherit' : 'pipe'
      });
      log(`Completed: ${description}`, 'success');
      return result;
    } else {
      log(`[DRY RUN] Would run: ${command}`, 'debug');
      return '';
    }
  } catch (error) {
    log(`Failed: ${description} - ${error.message}`, 'error');
    return null;
  }
}

// Problem detection system
class ProblemDetector {
  constructor() {
    this.problems = [];
    this.fixes = [];
  }

  async detectProblems() {
    log('Detecting problems across codebase...', 'info');

    // Check TypeScript configuration
    await this.checkTypeScriptConfig();

    // Check Next.js configuration
    await this.checkNextJsConfig();

    // Check for common code issues
    await this.checkCodeIssues();

    // Check for missing dependencies
    await this.checkDependencies();

    // Check for HTML entity corruption
    await this.checkHtmlEntityCorruption();

    // Check for hydration issues
    await this.checkHydrationIssues();

    // Check for missing files
    await this.checkMissingFiles();

    log(`Found ${this.problems.length} problems`, this.problems.length > 0 ? 'warning' : 'success');
    return this.problems;
  }

  async checkTypeScriptConfig() {
    const tsConfigPath = join(config.targetDir, 'tsconfig.json');
    if (existsSync(tsConfigPath)) {
      const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf8'));

      if (!tsConfig.compilerOptions?.downlevelIteration) {
        this.problems.push({
          type: 'config',
          severity: 'medium',
          file: 'tsconfig.json',
          issue: 'Missing downlevelIteration option',
          fix: 'Add downlevelIteration: true to compilerOptions'
        });
      }

      if (tsConfig.compilerOptions?.target === 'es5') {
        this.problems.push({
          type: 'config',
          severity: 'high',
          file: 'tsconfig.json',
          issue: 'Outdated ES5 target',
          fix: 'Update target to ES2020 or higher'
        });
      }
    }
  }

  async checkNextJsConfig() {
    const nextConfigPath = join(config.targetDir, 'next.config.js');
    if (existsSync(nextConfigPath)) {
      const content = readFileSync(nextConfigPath, 'utf8');

      if (content.includes('appDir')) {
        this.problems.push({
          type: 'config',
          severity: 'medium',
          file: 'next.config.js',
          issue: 'Deprecated appDir option in experimental',
          fix: 'Remove appDir from experimental options'
        });
      }
    }
  }

  async checkCodeIssues() {
    let glob;
    try {
      glob = (await import('glob')).default;
    } catch (error) {
      log('Glob module not found, skipping file checks', 'error');
      return;
    }
    const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', { cwd: config.targetDir }).slice(0, 50); // Limit for performance

    for (const file of files) {
      try {
        const content = readFileSync(join(config.targetDir, file), 'utf8');

        // Check for HTML entity corruption
        if (content.includes('"') || content.includes("'")) {
          this.problems.push({
            type: 'corruption',
            severity: 'high',
            file,
            issue: 'HTML entity corruption detected',
            fix: 'Replace HTML entities with proper characters'
          });
        }

        // Check for missing key props
        if (content.includes('.map(') && !content.includes('key=')) {
          this.problems.push({
            type: 'react',
            severity: 'medium',
            file,
            issue: 'Missing key props in map functions',
            fix: 'Add key props to mapped elements'
          });
        }

        // Check for unused imports
        const importMatches = content.match(/import.*from/g) || [];
        if (importMatches.length > 10) {
          this.problems.push({
            type: 'imports',
            severity: 'low',
            file,
            issue: 'Potentially many unused imports',
            fix: 'Clean up unused imports'
          });
        }

        // Check for corrupted import statements
        if (/import\s*{\s*$|import\s*{\s*\n\s*import/m.test(content)) {
          this.problems.push({
            type: 'corruption',
            severity: 'critical',
            file,
            issue: 'Corrupted import statements detected',
            fix: 'Fix malformed import statements'
          });
        }

        // Check for misplaced 'use client' directives
        const lines = content.split('\n');
        const useClientIndex = lines.findIndex(line => line.trim() === "'use client';");
        if (useClientIndex > 0) {
          for (let i = 0; i < useClientIndex; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('//') && !line.startsWith('/*')) {
              this.problems.push({
                type: 'nextjs',
                severity: 'critical',
                file,
                issue: 'Misplaced "use client" directive',
                fix: 'Move "use client" to the top of the file'
              });
              break;
            }
          }
        }

        // Check for missing error boundaries in risky components
        if (content.includes('PDF') || content.includes('upload') || content.includes('API')) {
          if (!content.includes('ErrorBoundary') && !content.includes('try')) {
            this.problems.push({
              type: 'reliability',
              severity: 'medium',
              file,
              issue: 'Missing error handling in risky component',
              fix: 'Add error boundary or try-catch blocks'
            });
          }
        }

        // Check for accessibility issues
        if (content.includes('<button') && !content.includes('aria-label')) {
          this.problems.push({
            type: 'accessibility',
            severity: 'medium',
            file,
            issue: 'Missing accessibility attributes on buttons',
            fix: 'Add aria-label attributes'
          });
        }

      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  async checkDependencies() {
    const packagePath = join(config.targetDir, 'package.json');
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

      const commonDeps = ['react', 'react-dom', 'next'];
      const missingDeps = commonDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );

      if (missingDeps.length > 0) {
        this.problems.push({
          type: 'dependencies',
          severity: 'high',
          file: 'package.json',
          issue: `Missing dependencies: ${missingDeps.join(', ')}`,
          fix: 'Install missing dependencies'
        });
      }
    }
  }

  async checkHtmlEntityCorruption() {
    let glob;
    try {
      glob = (await import('glob')).default;
    } catch (error) {
      log('Glob module not found, skipping corruption check', 'error');
      return;
    }
    const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', { cwd: config.targetDir });
    let corruptedFiles = 0;

    for (const file of files) {
      try {
        const content = readFileSync(join(config.targetDir, file), 'utf8');
        if (content.includes('"') || content.includes("'") || content.includes('&')) {
          corruptedFiles++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    if (corruptedFiles > 0) {
      this.problems.push({
        type: 'corruption',
        severity: 'critical',
        file: 'multiple',
        issue: `HTML entity corruption in ${corruptedFiles} files`,
        fix: 'Run HTML entity repair across all files'
      });
    }
  }

  async checkHydrationIssues() {
    let glob;
    try {
      glob = (await import('glob')).default;
    } catch (error) {
      log('Glob module not found, skipping hydration check', 'error');
      return;
    }
    const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', { cwd: config.targetDir });
    let hydrationIssues = 0;

    for (const file of files) {
      try {
        const content = readFileSync(join(config.targetDir, file), 'utf8');

        if (content.includes('localStorage.getItem') && !content.includes('typeof window')) {
          hydrationIssues++;
          this.problems.push({
            type: 'hydration',
            severity: 'critical',
            file,
            issue: 'localStorage access without SSR guard',
            fix: 'Add typeof window !== "undefined" guard'
          });
        }

        if (content.includes('window.matchMedia') && !content.includes('typeof window')) {
          hydrationIssues++;
          this.problems.push({
            type: 'hydration',
            severity: 'critical',
            file,
            issue: 'window access without SSR guard',
            fix: 'Add typeof window !== "undefined" guard'
          });
        }

        if (content.includes('document.documentElement') && !content.includes('typeof document')) {
          hydrationIssues++;
          this.problems.push({
            type: 'hydration',
            severity: 'high',
            file,
            issue: 'document access without SSR guard',
            fix: 'Add typeof document !== "undefined" guard'
          });
        }

        if (content.includes('ThemeProvider') && content.includes('useState') && !content.includes('mounted')) {
          this.problems.push({
            type: 'hydration',
            severity: 'critical',
            file,
            issue: 'Theme provider without hydration protection',
            fix: 'Add mounted state to prevent hydration mismatch'
          });
        }

      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  async checkMissingFiles() {
    const missingFiles = [
      { path: 'public/site.webmanifest', severity: 'medium', issue: 'Missing web manifest' },
      { path: 'public/robots.txt', severity: 'low', issue: 'Missing robots.txt' },
      { path: 'src/components/NoSSR.tsx', severity: 'low', issue: 'Missing NoSSR component' }
    ];

    missingFiles.forEach(({ path: filePath, severity, issue }) => {
      if (!existsSync(join(config.targetDir, filePath))) {
        this.problems.push({
          type: 'missing-files',
          severity,
          file: filePath,
          issue,
          fix: `Create ${filePath}`
        });
      }
    });
  }

  generateReport() {
    log('\nProblem Detection Report', 'info');
    log('============================', 'info');

    const severityCount = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    this.problems.forEach(problem => {
      severityCount[problem.severity]++;
      const icon = {
        critical: '[CRITICAL]',
        high: '[HIGH]',
        medium: '[MEDIUM]',
        low: '[LOW]'
      }[problem.severity];

      log(`${icon} ${problem.file}: ${problem.issue}`, 'info');
      if (config.verbose) {
        log(`   Fix: ${problem.fix}`, 'debug');
      }
    });

    log(`\nSummary: ${severityCount.critical} critical, ${severityCount.high} high, ${severityCount.medium} medium, ${severityCount.low} low`, 'info');

    return severityCount;
  }
}

// Layer execution system
async function executeLayer(layerNumber, description, scriptName) {
  if (config.skipLayers.includes(layerNumber.toString())) {
    log(`Skipping Layer ${layerNumber}: ${description}`, 'warning');
    return true;
  }

  log(`\nLayer ${layerNumber}: ${description}`, 'info');
  log('='.repeat(50), 'info');

  const scriptPath = join(config.targetDir, 'scripts', scriptName);

  if (!existsSync(scriptPath)) {
    log(`Script not found: ${scriptPath}`, 'error');
    return false;
  }

  const result = runCommand(`node "${scriptPath}"`, `Layer ${layerNumber} fixes`);
  return result !== null;
}

// Main execution
async function main() {
  try {
    // Ensure scripts directory exists
    const scriptsDir = join(config.targetDir, 'scripts');
    if (!existsSync(scriptsDir)) {
      mkdirSync(scriptsDir, { recursive: true });
    }

    // Install dependencies if needed
    try {
      await import('glob');
    } catch (error) {
      log('Installing required dependencies...', 'info');
      runCommand('npm install glob --save-dev', 'Install glob dependency');
    }

    // Problem detection phase
    const detector = new ProblemDetector();
    await detector.detectProblems();
    const severityCount = detector.generateReport();

    if (severityCount.critical === 0 && severityCount.high === 0) {
      log('\nNo critical or high-severity issues found!', 'success');
      if (severityCount.medium === 0 && severityCount.low === 0) {
        log('Codebase appears to be in good shape.', 'success');
        return;
      }
    }

    // Ask for confirmation unless in dry-run mode
    if (!config.dryRun && process.stdin.isTTY) {
      const { createInterface } = await import('readline');
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        rl.question('\nProceed with automated fixes? (y/N): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        log('Automated fixes cancelled by user.', 'info');
        return;
      }
    }

    // Execute layers
    const layers = [
      { number: 1, description: 'Configuration Fixes', script: 'fix-layer-1-config.js' },
      { number: 2, description: 'Bulk Pattern Fixes', script: 'fix-layer-2-patterns.js' },
      { number: 3, description: 'Component-Specific Fixes', script: 'fix-layer-3-components.js' },
      { number: 4, description: 'Hydration and SSR Fixes', script: 'fix-layer-4-hydration.js' },
      { number: 5, description: 'Next.js App Router Fixes', script: 'fix-layer-5-nextjs.js' },
      { number: 6, description: 'Testing and Validation Fixes', script: 'fix-layer-6-testing.js' }
    ];

    let successfulLayers = 0;

    for (const layer of layers) {
      const success = await executeLayer(layer.number, layer.description, layer.script);
      if (success) {
        successfulLayers++;
      } else {
        log(`Layer ${layer.number} failed, continuing with remaining layers...`, 'warning');
      }
    }

    // Final validation
    log('\nRunning final validation...', 'info');
    const buildResult = runCommand('npm run build', 'Final build validation');

    if (buildResult !== null) {
      log('\nAll fixes completed successfully!', 'success');
      log(` ${successfulLayers}/${layers.length} layers executed successfully`, 'success');
      log(' Final build validation passed', 'success');
    } else {
      log('\nFixes completed but build validation failed', 'warning');
      log('Please check the build output for remaining issues.', 'warning');
    }

  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Comprehensive Automated Fixing System

Usage: node fix-master.js [options]

Options:
  --dry-run           Show what would be done without making changes
  --verbose           Show detailed output
  --skip-layers 1,2   Skip specific layers (comma-separated)
  --help, -h          Show this help message

Layers:
  1. Configuration fixes (TypeScript, Next.js, package.json)
  2. Bulk pattern fixes (imports, types, HTML entities)
  3. Component-specific fixes (Button variants, Tabs props, etc.)
  4. Hydration and SSR fixes (client-side guards, theme providers)
  5. Next.js App Router fixes
  6. Testing and Validation Fixes

Examples:
  node fix-master.js                    # Run all fixes
  node fix-master.js --dry-run          # Preview changes
  node fix-master.js --skip-layers 1    # Skip configuration fixes
  node fix-master.js --verbose          # Detailed output
`);
  process.exit(0);
}

// Run the main function
main();
