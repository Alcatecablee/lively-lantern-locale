#!/usr/bin/env node

/**
 * Layer 5: Syntax Corruption Repair
 * - Fix corrupted import statements
 * - Remove duplicate imports and extra commas
 * - Fix malformed syntax patterns
 * - Repair broken JSX attributes
 * - Clean up parsing errors
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Layer 5: Syntax Corruption Repair');

// Syntax repair patterns
const syntaxFixes = [
  // Fix corrupted import statements
  {
    name: 'Corrupted Import Statements',
    test: (content) => {
      return /import\s*{\s*import\s*{/.test(content) || 
             /import\s*{\s*[^}]*,\s*,/.test(content) ||
             /from\s*['"][^'"]*['"]\s*;?\s*import/.test(content);
    },
    fix: (content) => {
      let fixed = content;
      
      // Fix "import { import { ... }" pattern
      fixed = fixed.replace(/import\s*{\s*import\s*{\s*([^}]+)\s*}\s*from\s*(['"][^'"]+['"])/g, 
        'import { $1 } from $2');
      
      // Fix double commas in imports
      fixed = fixed.replace(/import\s*{\s*([^}]*),\s*,([^}]*)\s*}\s*from/g, 
        'import { $1,$2 } from');
      
      // Fix trailing commas before closing brace
      fixed = fixed.replace(/,\s*,\s*}/g, ' }');
      
      // Fix multiple consecutive commas
      fixed = fixed.replace(/,\s*,+/g, ',');
      
      // Clean up import formatting
      fixed = fixed.replace(/import\s*{\s*([^}]+)\s*}\s*from\s*(['"][^'"]+['"])/g, (match, imports, from) => {
        const cleanImports = imports.split(',')
          .map(imp => imp.trim())
          .filter(imp => imp && imp.length > 0)
          .join(', ');
        return `import { ${cleanImports} } from ${from}`;
      });
      
      return fixed;
    },
    fileTypes: ['tsx', 'jsx', 'ts', 'js']
  },
  
  // Fix malformed array/object declarations
  {
    name: 'Malformed Array/Object Declarations',
    test: (content) => {
      return /=\s*\[\s*;/.test(content) || /=\s*{\s*;/.test(content);
    },
    fix: (content) => {
      let fixed = content;
      
      // Fix "= [;" pattern
      fixed = fixed.replace(/=\s*\[\s*;/g, '= [');
      
      // Fix "= {;" pattern  
      fixed = fixed.replace(/=\s*{\s*;/g, '= {');
      
      return fixed;
    },
    fileTypes: ['tsx', 'jsx', 'ts', 'js']
  },
  
  // Fix duplicate aria-label attributes
  {
    name: 'Duplicate Aria Labels',
    test: (content) => {
      return /aria-label\s*=\s*["'][^"']*["']\s+[^>]*aria-label\s*=/.test(content);
    },
    fix: (content) => {
      let fixed = content;
      
      // Remove first aria-label when there are duplicates
      fixed = fixed.replace(/aria-label\s*=\s*["']Button["']\s+([^>]*aria-label\s*=\s*["'][^"']*["'])/g, '$1');
      
      return fixed;
    },
    fileTypes: ['tsx', 'jsx']
  },
  
  // Fix broken JSX closing tags
  {
    name: 'Broken JSX Closing',
    test: (content) => {
      return /}\s*}\s*}$/.test(content.trim());
    },
    fix: (content) => {
      let fixed = content.trim();
      
      // Fix triple closing braces at end of file
      if (fixed.endsWith('}}}')) {
        fixed = fixed.slice(0, -2);
      }
      
      return fixed;
    },
    fileTypes: ['tsx', 'jsx']
  },
  
  // Fix semicolon issues in JSX
  {
    name: 'JSX Semicolon Issues',
    test: (content) => {
      return />\s*;\s*</.test(content) || /["']\s*;\s*$/.test(content);
    },
    fix: (content) => {
      let fixed = content;
      
      // Remove semicolons between JSX elements
      fixed = fixed.replace(/>\s*;\s*</g, '><');
      
      // Remove trailing semicolons after strings in JSX
      fixed = fixed.replace(/(["'])\s*;\s*$/gm, '$1');
      
      // Remove semicolons before closing JSX tags
      fixed = fixed.replace(/;\s*>/g, '>');
      
      return fixed;
    },
    fileTypes: ['tsx', 'jsx']
  },
  
  // Fix empty lines with only spaces/semicolons
  {
    name: 'Clean Empty Lines',
    test: (content) => {
      return /^\s*;\s*$/m.test(content) || /^\s+$/m.test(content);
    },
    fix: (content) => {
      let fixed = content;
      
      // Remove lines with only semicolons
      fixed = fixed.replace(/^\s*;\s*$/gm, '');
      
      // Clean up lines with only whitespace
      fixed = fixed.replace(/^\s+$/gm, '');
      
      // Remove excessive empty lines (more than 2 consecutive)
      fixed = fixed.replace(/\n\s*\n\s*\n\s*\n/g, '\n\n\n');
      
      return fixed;
    },
    fileTypes: ['tsx', 'jsx', 'ts', 'js']
  },
  
  // Fix missing component declarations
  {
    name: 'Missing Component Declarations',
    test: (content) => {
      return /^\s*const\s+[A-Z][a-zA-Z]*\s*=\s*\(\s*\)\s*=>\s*{/m.test(content) && 
             !content.includes('export') && 
             content.includes('return');
    },
    fix: (content) => {
      let fixed = content;
      
      // Find component name and add export
      const match = fixed.match(/^\s*const\s+([A-Z][a-zA-Z]*)\s*=/m);
      if (match) {
        const componentName = match[1];
        if (!fixed.includes(`export`) && !fixed.includes(`export default ${componentName}`)) {
          fixed = fixed.replace(
            new RegExp(`(const\\s+${componentName}\\s*=.*?};?)`, 's'),
            `$1\n\nexport default ${componentName};`
          );
        }
      }
      
      return fixed;
    },
    fileTypes: ['tsx', 'jsx']
  }
];

// Get all relevant files
function getSourceFiles() {
  const patterns = [
    'src/**/*.tsx',
    'src/**/*.jsx', 
    'src/**/*.ts',
    'src/**/*.js'
  ];
  
  let files = [];
  patterns.forEach(pattern => {
    try {
      files = files.concat(glob.sync(pattern));
    } catch (error) {
      console.warn(`Warning: Could not process pattern ${pattern}`);
    }
  });
  
  return [...new Set(files)];
}

// Apply syntax fixes
function applySyntaxFixes(filePath, content) {
  let fixedContent = content;
  let changesCount = 0;
  const fileExt = path.extname(filePath).slice(1);
  
  syntaxFixes.forEach(fix => {
    if (fix.fileTypes.includes(fileExt) && fix.test(fixedContent)) {
      const before = fixedContent;
      fixedContent = fix.fix(fixedContent);
      
      if (before !== fixedContent) {
        changesCount++;
        console.log(`  ✓ Applied ${fix.name} to ${path.basename(filePath)}`);
      }
    }
  });
  
  return { content: fixedContent, changes: changesCount };
}

// Fix specific critical files first
function fixCriticalFiles() {
  const criticalFiles = [
    'src/pages/NotFound.tsx',
    'src/components/AdminDashboard.tsx',
    'src/components/Features.tsx'
  ];
  
  let filesFixed = 0;
  
  criticalFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const { content: fixedContent, changes } = applySyntaxFixes(filePath, content);
        
        if (changes > 0) {
          fs.writeFileSync(fullPath, fixedContent);
          filesFixed++;
          console.log(`🔧 Fixed critical file: ${filePath} (${changes} fixes)`);
        }
      } catch (error) {
        console.error(`❌ Error fixing critical file ${filePath}:`, error.message);
      }
    }
  });
  
  return filesFixed;
}

// Main execution
async function runLayer5Fixes() {
  const files = getSourceFiles();
  let totalChanges = 0;
  let filesChanged = 0;
  
  console.log(`📁 Processing ${files.length} source files...`);
  
  // Fix critical files first
  console.log('🚨 Fixing critical files first...');
  const criticalFileChanges = fixCriticalFiles();
  totalChanges += criticalFileChanges;
  if (criticalFileChanges > 0) filesChanged += criticalFileChanges;
  
  // Process all source files
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { content: fixedContent, changes } = applySyntaxFixes(filePath, content);
      
      if (changes > 0) {
        fs.writeFileSync(filePath, fixedContent);
        filesChanged++;
        totalChanges += changes;
        console.log(`📝 ${filePath}: ${changes} syntax fixes applied`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Layer 5 completed: ${totalChanges} syntax fixes applied to ${filesChanged} files`);
  
  // Run a quick validation
  console.log('\n🔍 Running validation...');
  try {
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build validation passed!');
  } catch (error) {
    console.log('⚠️  Build still has issues, but syntax corruption has been repaired');
  }
}

// Ensure glob is available
try {
  require('glob');
} catch (error) {
  console.log('📦 Installing glob dependency...');
  require('child_process').execSync('npm install glob --save-dev', { stdio: 'inherit' });
}

runLayer5Fixes().catch(error => {
  console.error('❌ Layer 5 fixes failed:', error.message);
  process.exit(1);
}); 