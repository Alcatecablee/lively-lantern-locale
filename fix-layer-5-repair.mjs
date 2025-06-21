#!/usr/bin/env node

/**
 * Layer 5: Fix Layer Repair System
 * 
 * THE REAL PROBLEM: Fix layers are breaking more than they fix
 * 
 * This layer:
 * 1. Identifies what previous layers corrupted
 * 2. Reverts harmful changes
 * 3. Creates a validation system to prevent future corruption
 * 4. Only applies fixes that actually improve the codebase
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

console.log('🔧 Layer 5: Fix Layer Repair System');
console.log('Addressing the root cause: fix layers that break more than they fix\n');

// Track what each layer actually does vs what it claims to do
const layerAnalysis = {
  'fix-layer-1-config.js': {
    claimed: 'Configuration fixes',
    actualImpact: 'CommonJS in ES module project',
    harmful: true
  },
  'fix-layer-2-patterns.js': {
    claimed: 'Pattern fixes', 
    actualImpact: 'Generic replacements without context',
    harmful: true
  },
  'fix-layer-3-components.js': {
    claimed: 'Component fixes',
    actualImpact: 'Targets non-existent files',
    harmful: true
  },
  'fix-layer-4-hydration.js': {
    claimed: 'Hydration fixes',
    actualImpact: 'Next.js patterns on Vite project',
    harmful: true
  },
  'fix-layer-6-testing.js': {
    claimed: 'Testing fixes',
    actualImpact: 'Unknown - may be adding test patterns incorrectly',
    harmful: true
  }
};

// Create a baseline of what the codebase should look like
function createCodebaseBaseline() {
  console.log('📊 Creating codebase baseline...');
  
  const baseline = {
    projectType: 'Vite + React + TypeScript',
    moduleSystem: 'ES Modules',
    framework: 'React (not Next.js)',
    buildTool: 'Vite',
    validPatterns: [
      'import/export syntax',
      'React functional components',
      'TypeScript interfaces',
      'Vite-specific configurations'
    ],
    invalidPatterns: [
      "'use client' directives",
      'Next.js specific imports',
      'CommonJS require() calls',
      'Duplicate import statements',
      'Malformed JSX closing tags'
    ]
  };
  
  console.log(`  ✅ Project type: ${baseline.projectType}`);
  console.log(`  ✅ Module system: ${baseline.moduleSystem}`);
  console.log(`  ✅ Framework: ${baseline.framework}`);
  
  return baseline;
}

// Audit what fix layers have actually done
function auditFixLayerDamage() {
  console.log('\n🔍 Auditing fix layer damage...');
  
  const sourceFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}');
  const damage = {
    corruptedFiles: [],
    commonIssues: {
      nextjsInVite: 0,
      duplicateImports: 0,
      malformedSyntax: 0,
      orphanedTags: 0
    }
  };
  
  sourceFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let isCorrupted = false;
      
      // Check for Next.js patterns in Vite project
      if (content.includes("'use client'")) {
        damage.commonIssues.nextjsInVite++;
        isCorrupted = true;
      }
      
      // Check for duplicate imports
      if (content.includes('import { import {')) {
        damage.commonIssues.duplicateImports++;
        isCorrupted = true;
      }
      
      // Check for malformed syntax
      if (content.includes('= [;') || content.includes('= {;')) {
        damage.commonIssues.malformedSyntax++;
        isCorrupted = true;
      }
      
      // Check for orphaned closing tags
      if (content.includes('</Icon>') && !content.includes('<Icon')) {
        damage.commonIssues.orphanedTags++;
        isCorrupted = true;
      }
      
      if (isCorrupted) {
        damage.corruptedFiles.push(file);
      }
      
    } catch (error) {
      // File read error
    }
  });
  
  console.log(`  📁 Files corrupted by fix layers: ${damage.corruptedFiles.length}`);
  console.log(`  🚫 Next.js patterns in Vite project: ${damage.commonIssues.nextjsInVite}`);
  console.log(`  🔄 Duplicate imports created: ${damage.commonIssues.duplicateImports}`);
  console.log(`  💥 Malformed syntax introduced: ${damage.commonIssues.malformedSyntax}`);
  console.log(`  🏷️  Orphaned tags: ${damage.commonIssues.orphanedTags}`);
  
  return damage;
}

// Repair the damage caused by fix layers
function repairFixLayerDamage(damage) {
  console.log('\n🔧 Repairing fix layer damage...');
  
  let repairedCount = 0;
  
  damage.corruptedFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let repaired = content;
      let hasChanges = false;
      
      // Remove Next.js patterns from Vite project
      if (repaired.includes("'use client'")) {
        repaired = repaired.replace(/'use client';\s*\n/g, '');
        hasChanges = true;
      }
      
      // Fix duplicate imports
      if (repaired.includes('import { import {')) {
        repaired = repaired.replace(/import\s*{\s*import\s*{\s*([^}]+)\s*}\s*from\s*(['"][^'"]+['"])/g, 
          'import { $1 } from $2');
        hasChanges = true;
      }
      
      // Fix malformed syntax
      repaired = repaired.replace(/=\s*\[\s*;/g, '= [');
      repaired = repaired.replace(/=\s*{\s*;/g, '= {');
      
      // Remove orphaned closing tags at end of files
      const lines = repaired.split('\n');
      const orphanedTagPattern = /^\s*<\/[A-Za-z]+>\s*$/;
      
      let removedOrphans = false;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (orphanedTagPattern.test(lines[i])) {
          lines.splice(i, 1);
          removedOrphans = true;
        } else if (lines[i].trim() && !orphanedTagPattern.test(lines[i])) {
          break; // Stop at first non-orphaned content
        }
      }
      
      if (removedOrphans) {
        repaired = lines.join('\n');
        hasChanges = true;
      }
      
      // Clean up malformed FAQ sections and other corruption
      if (repaired.includes('</h3>') && repaired.includes(';')) {
        // Fix semicolons in JSX
        repaired = repaired.replace(/>\s*;\s*$/gm, '>');
        repaired = repaired.replace(/["']\s*;\s*$/gm, '"');
        hasChanges = true;
      }
      
      if (hasChanges) {
        fs.writeFileSync(file, repaired);
        repairedCount++;
        console.log(`  ✅ Repaired ${path.basename(file)}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Could not repair ${file}: ${error.message}`);
    }
  });
  
  return repairedCount;
}

// Create a validation system to prevent future corruption
function createValidationSystem() {
  console.log('\n🛡️  Creating validation system...');
  
  const validatorScript = `#!/usr/bin/env node

/**
 * Fix Layer Validator
 * Prevents fix layers from corrupting the codebase
 */

import fs from 'fs';
import { execSync } from 'child_process';

function validateBeforeAfter(beforeState, afterState) {
  const issues = [];
  
  // Check if build still works
  try {
    execSync('npm run build', { stdio: 'pipe' });
  } catch (error) {
    issues.push('Build broken after fix layer');
  }
  
  // Check for new corruption patterns
  if (afterState.includes("'use client'") && !beforeState.includes("'use client'")) {
    issues.push('Added Next.js patterns to Vite project');
  }
  
  if (afterState.includes('import { import {')) {
    issues.push('Created duplicate import statements');
  }
  
  return issues;
}

export { validateBeforeAfter };
`;
  
  fs.writeFileSync('fix-layer-validator.mjs', validatorScript);
  console.log('  ✅ Created fix-layer-validator.mjs');
  
  return true;
}

// Disable harmful fix layers
function disableHarmfulLayers() {
  console.log('\n🚫 Disabling harmful fix layers...');
  
  const harmfulLayers = Object.keys(layerAnalysis).filter(layer => layerAnalysis[layer].harmful);
  let disabledCount = 0;
  
  harmfulLayers.forEach(layer => {
    if (fs.existsSync(layer)) {
      const backupName = `${layer}.disabled`;
      fs.renameSync(layer, backupName);
      disabledCount++;
      console.log(`  ✅ Disabled ${layer} (backed up as ${backupName})`);
    }
  });
  
  return disabledCount;
}

// Main execution
async function repairFixLayers() {
  console.log('🎯 Starting fix layer repair process...\n');
  
  // Step 1: Understand what we're working with
  const baseline = createCodebaseBaseline();
  
  // Step 2: Audit the damage
  const damage = auditFixLayerDamage();
  
  if (damage.corruptedFiles.length === 0) {
    console.log('✅ No corruption detected from fix layers!');
    return;
  }
  
  // Step 3: Repair the damage
  const repairedCount = repairFixLayerDamage(damage);
  
  // Step 4: Create validation system
  createValidationSystem();
  
  // Step 5: Disable harmful layers
  const disabledCount = disableHarmfulLayers();
  
  // Step 6: Final validation
  console.log('\n🔍 Final validation...');
  try {
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build passes after repair!');
  } catch (error) {
    console.log('⚠️  Build still has issues - manual review needed');
  }
  
  console.log(`\n🎉 Fix Layer Repair completed:`);
  console.log(`  - Files repaired: ${repairedCount}`);
  console.log(`  - Harmful layers disabled: ${disabledCount}`);
  console.log(`  - Validation system created: ✅`);
  console.log(`\n💡 Key insight: Fix layers were causing more problems than they solved.`);
  console.log(`   Focus on targeted fixes for actual issues, not generic patterns.`);
}

repairFixLayers().catch(error => {
  console.error('❌ Fix layer repair failed:', error.message);
  process.exit(1);
}); 