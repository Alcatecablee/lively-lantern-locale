
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building NeuroLint CLI...');

// Clean release directory
const releaseDir = path.join(__dirname, 'release');
if (fs.existsSync(releaseDir)) {
  console.log('🧹 Cleaning release directory...');
  execSync('npx rimraf release', { stdio: 'inherit' });
}

// Create release directory
fs.mkdirSync(releaseDir, { recursive: true });

// Copy main files
const filesToCopy = [
  'index.js',
  'server.js',
  'package.json',
  'orchestration/',
  'processors/'
];

console.log('📦 Copying files to release...');

filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(releaseDir, file);
  
  if (fs.existsSync(srcPath)) {
    if (fs.statSync(srcPath).isDirectory()) {
      // Copy directory recursively
      copyDirectory(srcPath, destPath);
      console.log(`   ✅ Copied directory: ${file}`);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
      console.log(`   ✅ Copied file: ${file}`);
    }
  } else {
    console.warn(`   ⚠️  File not found: ${file}`);
  }
});

// Copy layer files from parent directory
console.log('📋 Copying layer files...');
const layerFiles = [
  '../fix-layer-1-config.js',
  '../fix-layer-2-patterns.js', 
  '../fix-layer-3-components.js',
  '../fix-layer-5-nextjs.js'
];

layerFiles.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const fileName = path.basename(file);
  const destPath = path.join(releaseDir, fileName);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`   ✅ Copied: ${fileName}`);
  } else {
    console.warn(`   ⚠️  Layer file not found: ${file}`);
  }
});

// Create README for release
const releaseReadme = `# NeuroLint CLI Release

This is a compiled release of the NeuroLint CLI tool.

## Installation

\`\`\`bash
npm install -g .
\`\`\`

## Usage

\`\`\`bash
neurolint analyze <file> --dry-run --verbose
neurolint upload <file>
neurolint fix-all
\`\`\`

## API Server

\`\`\`bash
npm run start:server
\`\`\`

Built on: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(releaseDir, 'README.md'), releaseReadme);

// Make CLI executable
const cliPath = path.join(releaseDir, 'index.js');
if (fs.existsSync(cliPath)) {
  try {
    fs.chmodSync(cliPath, '755');
    console.log('✅ Made CLI executable');
  } catch (error) {
    console.warn('⚠️  Could not make CLI executable:', error.message);
  }
}

console.log('🎉 Build completed successfully!');
console.log(`📁 Release directory: ${releaseDir}`);
console.log('\nNext steps:');
console.log('1. cd release');
console.log('2. npm install');
console.log('3. npm link (for global installation)');
console.log('4. neurolint --help');

// Utility function to copy directories
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
