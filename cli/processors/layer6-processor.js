
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

    // Add error boundaries for components that might fail
    if (content.includes('export default function') && 
        content.includes('useState') && 
        !content.includes('ErrorBoundary') &&
        (content.includes('PDF') || content.includes('upload') || content.includes('API'))) {
      
      const componentMatch = content.match(/export default function (\w+)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        const errorBoundaryWrapper = `function ${componentName}WithErrorBoundary(props) {
  try {
    return React.createElement(${componentName}, props);
  } catch (error) {
    console.error('Component error:', error);
    return React.createElement('div', {
      className: 'p-4 text-red-600 bg-red-50 rounded-lg'
    }, 'Something went wrong. Please try again.');
  }
}

`;
        
        transformed = content.replace(
          `export default function ${componentName}`,
          `${errorBoundaryWrapper}function ${componentName}`
        ) + `\n\nexport default ${componentName}WithErrorBoundary;`;
        changes++;
      }
    }

    // Add loading states for async operations
    if (content.includes('async') && 
        content.includes('useState') &&
        !content.includes('loading') &&
        !content.includes('isLoading')) {
      
      const stateMatch = content.match(/const \[([^,]+),\s*set[^\]]+\] = useState/);
      if (stateMatch) {
        transformed = transformed.replace(
          stateMatch[0],
          `const [isLoading, setIsLoading] = useState(false);\n  ${stateMatch[0]}`
        );
        changes++;
      }
    }

    // Add accessibility attributes
    if (content.includes('<button') && !content.includes('aria-label')) {
      transformed = transformed.replace(
        /<button([^>]*?)>/g,
        (match, attributes) => {
          if (!attributes.includes('aria-label')) {
            changes++;
            return `<button${attributes} aria-label="Button">`;
          }
          return match;
        }
      );
    }

    // Add React.memo for pure components
    if (content.includes('export default function') && 
        !content.includes('useState') &&
        !content.includes('useEffect') &&
        !content.includes('React.memo') &&
        content.includes('props')) {
      
      const componentMatch = content.match(/export default function (\w+)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        transformed = transformed.replace(
          `export default function ${componentName}`,
          `const ${componentName} = React.memo(function ${componentName}`
        ).replace(
          /}\s*$/, 
          '});\n\nexport default ' + componentName + ';'
        );
        changes++;
      }
    }

    // Fix TypeScript strict mode issues
    if (content.includes('any') && !content.includes('// @ts-ignore')) {
      transformed = transformed.replace(/:\s*any(?!\[\])/g, ': unknown');
      transformed = transformed.replace(/any\[\]/g, 'unknown[]');
      changes++;
    }

    // Add error handling for async operations
    if (content.includes('async') && 
        content.includes('await') &&
        !content.includes('try') &&
        !content.includes('catch')) {
      
      const asyncFunctionMatch = content.match(/(const \w+ = async \([^)]*\) => {[\s\S]*?})/);
      if (asyncFunctionMatch) {
        const asyncFunction = asyncFunctionMatch[1];
        const wrappedFunction = asyncFunction.replace(
          /(async \([^)]*\) => {)([\s\S]*)(})/,
          '$1\n    try {$2\n    } catch (error) {\n      console.error("Error:", error);\n    }\n  $3'
        );
        transformed = transformed.replace(asyncFunction, wrappedFunction);
        changes++;
      }
    }

    return transformed;
  }
}

module.exports = Layer6Processor;
