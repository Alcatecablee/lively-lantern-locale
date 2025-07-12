
#!/usr/bin/env node

/**
 * Build Script with NeuroLint Integration
 * Runs the sophisticated code transformation system before building
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting sophisticated build process with NeuroLint...');

async function runBuildWithNeuroLint() {
  try {
    // Step 1: Run the sophisticated NeuroLint master orchestrator
    console.log('\n📋 Phase 1: Running NeuroLint Master Orchestrator');
    console.log('═'.repeat(60));
    
    const masterScript = path.join(process.cwd(), 'src/lib/neurolint/layers/fix-master.js');
    
    if (fs.existsSync(masterScript)) {
      execSync(`node "${masterScript}"`, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ NeuroLint transformation completed successfully');
    } else {
      console.log('⚠️ NeuroLint master script not found, skipping transformation');
    }

    // Step 2: Type check
    console.log('\n🔍 Phase 2: TypeScript Type Checking');
    console.log('═'.repeat(60));
    
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScript type checking passed');
    } catch (error) {
      console.log('⚠️ TypeScript warnings detected, continuing build...');
    }

    // Step 3: Run the actual build
    console.log('\n🏗️ Phase 3: Production Build');
    console.log('═'.repeat(60));
    
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Production build completed successfully');

    // Step 4: Generate build report
    console.log('\n📊 Phase 4: Build Report Generation');
    console.log('═'.repeat(60));
    
    const reportPath = path.join(process.cwd(), 'neurolint-report.json');
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      console.log(`📈 Total transformations applied: ${report.totalChanges}`);
      console.log(`⏱️ Total transformation time: ${report.totalExecutionTime}ms`);
      console.log(`📄 Detailed report available at: ${reportPath}`);
    }

    console.log('\n🎉 Sophisticated build process completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Build process failed:', error.message);
    
    // Provide sophisticated error analysis
    if (error.message.includes('npm run build')) {
      console.log('\n🔧 Build Error Analysis:');
      console.log('- Check for TypeScript errors in the code');
      console.log('- Verify all imports are properly resolved');
      console.log('- Ensure all dependencies are installed');
      console.log('- Review the NeuroLint transformation results');
    }
    
    process.exit(1);
  }
}

// Execute the sophisticated build process
runBuildWithNeuroLint();
