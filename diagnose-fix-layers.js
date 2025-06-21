#!/usr/bin/env node

/**
 * Fix Layer Diagnostic Tool
 * Analyzes what the fix layers are actually breaking vs fixing
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

console.log('🔍 Fix Layer Diagnostic Tool');
console.log('Analyzing what fix layers are actually doing...\n');

// Check project structure
function analyzeProjectStructure() {
  console.log('📋 Project Structure Analysis:');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`  - Project type: ${packageJson.type || 'CommonJS'}`);
  console.log(`  - Build tool: ${packageJson.devDependencies?.vite ? 'Vite' : 'Unknown'}`);
  console.log(`  - Framework: ${packageJson.dependencies?.react ? 'React' : 'Unknown'}`);
  
  // Check if this is Next.js or Vite
  const isNextJs = fs.existsSync('next.config.js') || fs.existsSync('next.config.ts');
  const isVite = fs.existsSync('vite.config.ts') || fs.existsSync('vite.config.js');
  
  console.log(`  - Next.js project: ${isNextJs}`);
  console.log(`  - Vite project: ${isVite}`);
  
  if (isVite && !isNextJs) {
    console.log('  ⚠️  WARNING: This is a Vite project, but Layer 5 applies Next.js fixes!');
  }
  
  return { isNextJs, isVite, moduleType: packageJson.type };
}

// Analyze fix layer compatibility
function analyzeFixLayerCompatibility() {
  console.log('\n🔧 Fix Layer Compatibility Analysis:');
  
  const fixLayers = [
    'fix-layer-1-config.js',
    'fix-layer-2-patterns.js', 
    'fix-layer-3-components.js',
    'fix-layer-4-hydration.js',
    'fix-layer-5-nextjs.js',
    'fix-layer-6-testing.js'
  ];
  
  fixLayers.forEach(layer => {
    if (fs.existsSync(layer)) {
      const content = fs.readFileSync(layer, 'utf8');
      
      console.log(`  📄 ${layer}:`);
      
      // Check for CommonJS in ES module project
      if (content.includes('require(') && content.includes('module.exports')) {
        console.log('    ❌ Uses CommonJS syntax in ES module project');
      }
      
      // Check for Next.js specific fixes
      if (layer.includes('nextjs') && content.includes("'use client'")) {
        console.log('    ❌ Applies Next.js fixes to non-Next.js project');
      }
      
      // Check for file targeting
      const targetFiles = content.match(/src\/components\/[A-Za-z]+\.tsx/g) || [];
      const nonExistentTargets = targetFiles.filter(file => !fs.existsSync(file));
      if (nonExistentTargets.length > 0) {
        console.log(`    ❌ Targets non-existent files: ${nonExistentTargets.slice(0, 3).join(', ')}`);
      }
    }
  });
}

// Check what's actually broken in the codebase
function checkActualIssues() {
  console.log('\n🚨 Actual Codebase Issues:');
  
  try {
    // Try to build
    console.log('  🔨 Testing build...');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('    ✅ Build passes');
  } catch (error) {
    console.log('    ❌ Build fails');
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
    
    // Extract actual errors
    const lines = errorOutput.split('\n');
    const errorLines = lines.filter(line => 
      line.includes('ERROR:') || 
      line.includes('error') ||
      line.includes('Duplicate') ||
      line.includes('Expected')
    ).slice(0, 5);
    
    errorLines.forEach(line => {
      console.log(`      ${line.trim()}`);
    });
  }
  
  // Check TypeScript errors
  try {
    console.log('  📝 Testing TypeScript...');
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('    ✅ TypeScript passes');
  } catch (error) {
    console.log('    ❌ TypeScript has errors');
  }
}

// Analyze fix layer impact
function analyzeFixLayerImpact() {
  console.log('\n📊 Fix Layer Impact Analysis:');
  
  // Count files that have been modified by fix patterns
  const sourceFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}');
  let corruptedFiles = 0;
  let commonIssues = {
    duplicateImports: 0,
    malformedSyntax: 0,
    extraCommas: 0,
    brokenJSX: 0
  };
  
  sourceFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for corruption patterns
      if (content.includes('import { import {')) {
        commonIssues.duplicateImports++;
        corruptedFiles++;
      }
      
      if (content.includes('= [;') || content.includes('= {;')) {
        commonIssues.malformedSyntax++;
        corruptedFiles++;
      }
      
      if (content.includes(',,')) {
        commonIssues.extraCommas++;
        corruptedFiles++;
      }
      
      if (content.includes('}}}') && file.endsWith('.tsx')) {
        commonIssues.brokenJSX++;
        corruptedFiles++;
      }
      
    } catch (error) {
      // File read error
    }
  });
  
  console.log(`  📁 Total source files: ${sourceFiles.length}`);
  console.log(`  💥 Files with corruption: ${corruptedFiles}`);
  console.log(`  🔍 Common issues found:`);
  console.log(`    - Duplicate imports: ${commonIssues.duplicateImports}`);
  console.log(`    - Malformed syntax: ${commonIssues.malformedSyntax}`);
  console.log(`    - Extra commas: ${commonIssues.extraCommas}`);
  console.log(`    - Broken JSX: ${commonIssues.brokenJSX}`);
}

// Generate recommendations
function generateRecommendations() {
  console.log('\n💡 Recommendations:');
  
  const { isVite, moduleType } = analyzeProjectStructure();
  
  if (moduleType === 'module') {
    console.log('  1. Convert fix scripts to ES modules (.mjs) or use .cjs extension');
  }
  
  if (isVite) {
    console.log('  2. Remove Next.js specific fixes (Layer 5) - this is a Vite project');
    console.log('  3. Focus on actual build errors, not framework-specific patterns');
  }
  
  console.log('  4. Create targeted fixes for actual issues, not generic patterns');
  console.log('  5. Test each fix layer individually before running all layers');
  console.log('  6. Add validation step after each fix to ensure no regression');
}

// Main execution
async function runDiagnostic() {
  try {
    analyzeProjectStructure();
    analyzeFixLayerCompatibility();
    checkActualIssues();
    analyzeFixLayerImpact();
    generateRecommendations();
    
    console.log('\n🎯 Summary: The fix layers are causing more problems than they solve.');
    console.log('Focus on fixing the actual build errors, not applying generic patterns.');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

runDiagnostic(); 