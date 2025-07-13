
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { executeLayerSafely, calculateChanges, detectImprovements } = require('./index');

console.log('🧪 Running NeuroLint CLI Tests...');

// Test cases
const testCases = [
  {
    name: 'HTML Entity Fix',
    input: 'const title = &quot;Hello World&quot;;',
    expected: 'const title = "Hello World";',
    layer: 2
  },
  {
    name: 'Missing Key Props',
    input: 'items.map(item => <li>{item.name}</li>)',
    expected: 'key=',
    layer: 3
  },
  {
    name: 'SSR Guard',
    input: 'const data = localStorage.getItem("key");',
    expected: 'typeof window !== "undefined"',
    layer: 4
  }
];

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    try {
      console.log(`\n🔬 Testing: ${test.name}`);
      
      // Simple mock layer function for testing
      const mockLayer = {
        id: test.layer,
        name: test.name,
        fn: async (content) => {
          // Simulate transformation based on layer
          switch (test.layer) {
            case 2:
              return content.replace(/&quot;/g, '"');
            case 3:
              return content.replace(/\.map\(([^)]+)\) => <(\w+)/, '.map($1, index) => <$2 key={index}');
            case 4:
              return content.replace(/localStorage\./g, 'typeof window !== "undefined" && localStorage.');
            default:
              return content;
          }
        }
      };

      const result = await executeLayerSafely(mockLayer.fn, test.input, mockLayer, { verbose: false });
      
      if (result.content.includes(test.expected)) {
        console.log(`   ✅ PASS: ${test.name}`);
        passed++;
      } else {
        console.log(`   ❌ FAIL: ${test.name}`);
        console.log(`      Expected: ${test.expected}`);
        console.log(`      Got: ${result.content}`);
        failed++;
      }
      
    } catch (error) {
      console.log(`   💥 ERROR: ${test.name} - ${error.message}`);
      failed++;
    }
  }

  // Test utility functions
  console.log('\n⚙️  Testing Utilities...');
  
  const before = 'const a = 1;\nconst b = 2;';
  const after = 'const a = 1;\nconst b = 2;\nconst c = 3;';
  const changes = calculateChanges(before, after);
  
  if (changes > 0) {
    console.log('   ✅ PASS: calculateChanges');
    passed++;
  } else {
    console.log('   ❌ FAIL: calculateChanges');
    failed++;
  }

  const improvements = detectImprovements(before, after, 2);
  if (improvements.length > 0) {
    console.log('   ✅ PASS: detectImprovements');
    passed++;
  } else {
    console.log('   ❌ FAIL: detectImprovements');
    failed++;
  }

  // Summary
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('💥 Test suite failed:', error.message);
  process.exit(1);
});
