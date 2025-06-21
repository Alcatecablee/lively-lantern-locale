#!/usr/bin/env node

/**
 * Layer 5: Targeted Issue Resolution
 * - Fix only actual build errors, not generic patterns
 * - Remove framework-specific fixes that don't apply
 * - Focus on real syntax issues, not imaginary ones
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

console.log('🎯 Layer 5: Targeted Issue Resolution');
console.log('Fixing only actual issues, not applying generic patterns...\n');

// Get actual build errors
function getActualBuildErrors() {
  try {
    execSync('npm run build', { stdio: 'pipe' });
    return [];
  } catch (error) {
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
    const lines = errorOutput.split('\n');
    
    const errors = [];
    lines.forEach(line => {
      // Extract file path and error details
      if (line.includes('ERROR:') || line.includes('Duplicate')) {
        const match = line.match(/([^:]+):(\d+):(\d+):\s*(.+)/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            message: match[4]
          });
        }
      }
    });
    
    return errors;
  }
}

// Fix specific build errors
function fixBuildErrors(errors) {
  let fixedCount = 0;
  
  errors.forEach(error => {
    console.log(`🔧 Fixing: ${error.file}:${error.line} - ${error.message}`);
    
    try {
      const content = fs.readFileSync(error.file, 'utf8');
      let fixed = content;
      
      // Fix duplicate aria-label
      if (error.message.includes('Duplicate "aria-label"')) {
        const lines = content.split('\n');
        const errorLine = lines[error.line - 1];
        
        // Remove the first aria-label="Button" if it exists
        if (errorLine.includes('aria-label="Button"')) {
          lines[error.line - 1] = errorLine.replace(/aria-label="Button"\s*/, '');
          fixed = lines.join('\n');
          fixedCount++;
          console.log(`  ✅ Removed duplicate aria-label from ${path.basename(error.file)}`);
        }
      }
      
      // Fix syntax errors
      if (error.message.includes('Expected identifier but found')) {
        // This usually indicates malformed JSX or syntax
        const lines = content.split('\n');
        const errorLine = lines[error.line - 1];
        
        // Common patterns to fix
        if (errorLine.includes('</')) {
          // Likely a malformed closing tag
          const prevLine = lines[error.line - 2];
          if (prevLine && prevLine.trim().endsWith(';')) {
            lines[error.line - 2] = prevLine.replace(/;\s*$/, '');
            fixed = lines.join('\n');
            fixedCount++;
            console.log(`  ✅ Fixed malformed syntax in ${path.basename(error.file)}`);
          }
        }
      }
      
      if (fixed !== content) {
        fs.writeFileSync(error.file, fixed);
      }
      
    } catch (fileError) {
      console.log(`  ❌ Could not fix ${error.file}: ${fileError.message}`);
    }
  });
  
  return fixedCount;
}

// Remove framework-incompatible fixes
function removeIncompatibleFixes() {
  console.log('🧹 Removing framework-incompatible patterns...');
  
  const sourceFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}');
  let cleanedCount = 0;
  
  sourceFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let cleaned = content;
      
      // Remove 'use client' directives (this is Vite, not Next.js)
      if (cleaned.includes("'use client'")) {
        cleaned = cleaned.replace(/'use client';\s*\n/g, '');
        cleanedCount++;
        console.log(`  ✅ Removed 'use client' from ${path.basename(file)}`);
      }
      
      // Fix duplicate imports that were created by fix scripts
      if (cleaned.includes('import { import {')) {
        cleaned = cleaned.replace(/import\s*{\s*import\s*{\s*([^}]+)\s*}\s*from\s*(['"][^'"]+['"])/g, 
          'import { $1 } from $2');
        cleanedCount++;
        console.log(`  ✅ Fixed duplicate imports in ${path.basename(file)}`);
      }
      
      if (cleaned !== content) {
        fs.writeFileSync(file, cleaned);
      }
      
    } catch (error) {
      // Skip files that can't be read
    }
  });
  
  return cleanedCount;
}

// Validate fixes
function validateFixes() {
  console.log('\n🔍 Validating fixes...');
  
  try {
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build validation passed!');
    return true;
  } catch (error) {
    console.log('❌ Build still has issues:');
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
    const lines = errorOutput.split('\n');
    const errorLines = lines.filter(line => 
      line.includes('ERROR:') || line.includes('error')
    ).slice(0, 3);
    
    errorLines.forEach(line => {
      console.log(`  ${line.trim()}`);
    });
    return false;
  }
}

// Main execution
async function runTargetedFixes() {
  console.log('🔍 Analyzing actual build errors...');
  const buildErrors = getActualBuildErrors();
  
  if (buildErrors.length === 0) {
    console.log('✅ No build errors found!');
    return;
  }
  
  console.log(`Found ${buildErrors.length} actual build errors to fix:\n`);
  
  // Fix actual build errors
  const buildFixCount = fixBuildErrors(buildErrors);
  
  // Remove incompatible framework fixes
  const cleanupCount = removeIncompatibleFixes();
  
  console.log(`\n📊 Summary:`);
  console.log(`  - Build errors fixed: ${buildFixCount}`);
  console.log(`  - Incompatible patterns removed: ${cleanupCount}`);
  
  // Validate the fixes
  const isValid = validateFixes();
  
  if (isValid) {
    console.log('\n🎉 Layer 5 completed successfully!');
    console.log('✅ All fixes applied correctly and build passes.');
  } else {
    console.log('\n⚠️  Layer 5 completed with remaining issues.');
    console.log('🔧 Manual intervention may be required for complex errors.');
  }
}

runTargetedFixes().catch(error => {
  console.error('❌ Targeted fixes failed:', error.message);
  process.exit(1);
}); 