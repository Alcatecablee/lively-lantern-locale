
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('NeuroLint CLI Test Suite Starting...');

const testCases = [
  {
    name: 'Layer 1 - Config Fix',
    input: 'const config = { target: "ES5" };',
    expected: 'const config = { target: "ES2022" };',
    layer: 1
  },
  {
    name: 'Layer 2 - Entity Fix',
    input: '<div>Hello &quot;world&quot;</div>',
    expected: '<div>Hello "world"</div>',
    layer: 2
  },
  {
    name: 'Layer 3 - React Key',
    input: 'items.map(item => <div>{item}</div>)',
    expected: 'items.map((item, index) => <div key={index}>{item}</div>)',
    layer: 3
  },
  {
    name: 'Layer 4 - SSR Guard',
    input: 'localStorage.getItem("key")',
    expected: 'typeof window !== "undefined" && localStorage.getItem("key")',
    layer: 4
  },
  {
    name: 'Layer 5 - Next.js Client',
    input: 'import { useState } from "react";\nfunction Component() {}',
    expected: '"use client";\nimport { useState } from "react";\nfunction Component() {}',
    layer: 5
  },
  {
    name: 'Layer 6 - Testing',
    input: 'function test() { console.log("test"); }',
    expected: 'import { describe, it, expect } from "vitest";\nfunction test() { console.log("test"); }',
    layer: 6
  }
];

async function runTests() {
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    try {
      console.log(`\nTesting: ${test.name}`);
      
      // Create temp file
      const tempFile = path.join(__dirname, 'temp-test.js');
      fs.writeFileSync(tempFile, test.input);
      
      // Import layer processor dynamically
      const LayerIntegrator = require('./layer-integrator');
      const integrator = new LayerIntegrator();
      
      // Run layer
      const result = await integrator.runSingleLayer(test.input, tempFile, test.layer, {
        dryRun: true,
        verbose: false
      });
      
      // Clean up
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      
      // Check result
      if (result && result.transformedCode && result.transformedCode.includes(test.expected)) {
        console.log(`   PASS: ${test.name}`);
        passed++;
      } else {
        console.log(`   FAIL: ${test.name}`);
        console.log(`      Expected: ${test.expected}`);
        console.log(`      Got: ${result.content}`);
        failed++;
      }
      
    } catch (error) {
      console.log(`   ERROR: ${test.name} - ${error.message}`);
      failed++;
    }
  }
  
  // Test utilities
  console.log('\nTesting Utilities...');
  
  try {
    const changes = calculateChanges('before', 'after');
    if (typeof changes === 'number') {
      console.log('   PASS: calculateChanges');
    } else {
      console.log('   FAIL: calculateChanges');
    }
  } catch (error) {
    console.log('   FAIL: calculateChanges');
  }
  
  try {
    const improvements = detectImprovements('before', 'after', 1);
    if (Array.isArray(improvements)) {
      console.log('   PASS: detectImprovements');
    } else {
      console.log('   FAIL: detectImprovements');
    }
  } catch (error) {
    console.log('   FAIL: detectImprovements');
  }
  
  // Final results
  console.log('\nTest Results:');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\nAll tests passed!');
    process.exit(0);
  } else {
    console.log('\nSome tests failed');
    process.exit(1);
  }
}

function calculateChanges(before, after) {
  if (before === after) return 0;
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  return Math.abs(beforeLines.length - afterLines.length) + 
         beforeLines.filter((line, i) => line !== afterLines[i]).length;
}

function detectImprovements(before, after, layerId) {
  const improvements = [];
  
  if (before === after) {
    return ['No changes needed'];
  }
  
  // Layer-specific improvement detection
  switch (layerId) {
    case 1:
      if (after.includes('"target": "ES2022"')) improvements.push('Upgraded TypeScript target');
      break;
    case 2:
      if (after.split('&quot;').length < before.split('&quot;').length) improvements.push('Fixed HTML entities');
      break;
    case 3:
      if (after.split('key=').length > before.split('key=').length) improvements.push('Added missing React keys');
      break;
    case 4:
      if (after.includes('typeof window')) improvements.push('Added SSR guards');
      break;
    case 5:
      if (after.includes("'use client'")) improvements.push('Fixed Next.js client components');
      break;
    case 6:
      if (after.includes('test(') || after.includes('expect(')) improvements.push('Enhanced testing patterns');
      break;
  }
  
  return improvements.length > 0 ? improvements : ['Code transformation applied'];
}

if (require.main === module) {
  runTests().catch(error => {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests, calculateChanges, detectImprovements };
