
// Layer 6: Testing Enhancements Processor
// Integrates with fix-layer-6-testing.js patterns

class Layer6Processor {
  static processTesting(content) {
    let transformed = content;
    let changes = 0;

    // Add test utilities if test files detected
    if (content.includes('test(') || content.includes('describe(')) {
      
      // Add React Testing Library imports if missing
      if (content.includes('@testing-library/react') === false && content.includes('render(')) {
        const importStatement = "import { render, screen, fireEvent } from '@testing-library/react';\n";
        transformed = importStatement + transformed;
        changes++;
      }

      // Add jest-dom imports if missing
      if (content.includes('@testing-library/jest-dom') === false && content.includes('toBeInTheDocument')) {
        const importStatement = "import '@testing-library/jest-dom';\n";
        transformed = importStatement + transformed;
        changes++;
      }

      // Fix async test patterns
      const asyncTestPattern = /test\((['"][^'"]+['"])\s*,\s*async\s*\(\s*\)\s*=>\s*{([^}]+)}\)/g;
      transformed = transformed.replace(asyncTestPattern, (match, testName, testBody) => {
        if (!testBody.includes('await')) {
          return match; // No async operations, keep as is
        }
        changes++;
        return `test(${testName}, async () => {
  ${testBody.trim()}
});`;
      });

      // Add proper cleanup for component tests
      if (content.includes('render(') && !content.includes('cleanup')) {
        const cleanupImport = "import { cleanup } from '@testing-library/react';\n";
        const afterEachCleanup = "\nafterEach(cleanup);\n";
        
        transformed = cleanupImport + transformed + afterEachCleanup;
        changes++;
      }
    }

    return transformed;
  }
}

module.exports = Layer6Processor;
