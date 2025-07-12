// Layer 6: Testing Enhancements Processor
// Integrates with fix-layer-6-testing.js comprehensive patterns

class Layer6Processor {
  static processTesting(content) {
    let transformed = content;
    let changes = 0;

    // Add error boundaries for components that might fail
    if (content.includes('export default function') && 
        content.includes('useState') && 
        !content.includes('ErrorBoundary') &&
        !content.includes('componentDidCatch') &&
        (content.includes('PDF') || content.includes('upload') || content.includes('API') || content.includes('fetch'))) {
      
      const componentMatch = content.match(/export default function (\w+)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        const errorBoundaryWrapper = `function ${componentName}WithErrorBoundary(props) {
  try {
    return React.createElement(${componentName}, props);
  } catch (error) {
    console.error('Component error:', error);
    return React.createElement('div', {
      className: 'p-4 text-red-600 bg-red-50 rounded-lg border border-red-200'
    }, React.createElement('h3', { className: 'font-semibold' }, 'Something went wrong'), 
       React.createElement('p', { className: 'text-sm mt-1' }, 'Please try again later.'));
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

    // Add proper prop validation - interface definitions for components missing them
    const componentMatch = content.match(/export default function (\w+)\(\s*{\s*([^}]+)\s*}/);
    if (componentMatch && !content.includes('interface') && !content.includes('type Props')) {
      const [, componentName, props] = componentMatch;
      const propNames = props.split(',').map(p => p.trim().split(':')[0].trim());
      
      const interfaceDefinition = `interface ${componentName}Props {
  ${propNames.map(prop => `${prop}: any; // TODO: Define proper type`).join('\n  ')}
}

`;
      
      transformed = interfaceDefinition + transformed.replace(
        `export default function ${componentName}({ ${props} }`,
        `export default function ${componentName}({ ${props} }: ${componentName}Props`
      );
      changes++;
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

    // Validate component exports - ensure components have proper default exports
    const functionMatch = content.match(/function (\w+)\s*\(/);
    if (functionMatch && !content.includes(`export default ${functionMatch[1]}`) && !content.includes('export default function')) {
      transformed = transformed + `\n\nexport default ${functionMatch[1]};`;
      changes++;
    }

    // Add comprehensive accessibility attributes
    if (content.includes('<button') && 
        !content.includes('aria-label') &&
        !content.includes('aria-describedby')) {
      
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

    // Add alt text to images without them
    if (content.includes('<img') && !content.includes('alt=')) {
      transformed = transformed.replace(
        /<img([^>]*?)>/g,
        (match, attributes) => {
          if (!attributes.includes('alt=')) {
            changes++;
            return `<img${attributes} alt="Image">`;
          }
          return match;
        }
      );
    }

    // Add role attributes to interactive elements
    if (content.includes('<div') && content.includes('onClick')) {
      transformed = transformed.replace(
        /<div([^>]*?)onClick/g,
        (match, attributes) => {
          if (!attributes.includes('role=')) {
            changes++;
            return `<div${attributes} role="button" onClick`;
          }
          return match;
        }
      );
    }

    // Add React.memo for pure components (performance optimization)
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

    // Add useMemo for expensive computations
    if (content.includes('useState') && 
        content.includes('.map(') && 
        !content.includes('useMemo')) {
      
      // Look for expensive array operations
      const expensiveOperations = content.match(/const\s+(\w+)\s+=\s+[^.]+\.map\([^)]+\)/g);
      if (expensiveOperations) {
        expensiveOperations.forEach(operation => {
          const variableName = operation.match(/const\s+(\w+)\s+=/)?.[1];
          if (variableName) {
            transformed = transformed.replace(
              operation,
              `const ${variableName} = useMemo(() => ${operation.replace(/const\s+\w+\s+=\s+/, '')}, [])`
            );
            changes++;
          }
        });
      }
    }

    // Validate circular dependencies
    if (content.includes('import') && content.includes('from')) {
      const imports = content.match(/import.*from ['"]([^'"]+)['"]/g) || [];
      const hasCircularDependency = imports.some(imp => {
        const importPath = imp.match(/from ['"]([^'"]+)['"]/)?.[1];
        if (importPath && importPath.startsWith('.')) {
          // Basic circular dependency detection
          return importPath.includes('../') && importPath.length > 10; // Simple heuristic
        }
        return false;
      });
      
      if (hasCircularDependency) {
        transformed = `// Warning: Potential circular dependency detected\n// Consider refactoring to avoid circular imports\n\n${transformed}`;
        changes++;
      }
    }

    // Fix TypeScript strict mode issues
    if (content.includes('any') && !content.includes('// @ts-ignore')) {
      // Replace 'any' with more specific types where possible
      const beforeAnyFix = transformed;
      transformed = transformed.replace(/:\s*any(?!\[\])/g, ': unknown');
      transformed = transformed.replace(/any\[\]/g, 'unknown[]');
      
      // Add proper typing for event handlers
      transformed = transformed.replace(
        /onClick=\{([^}]+)\}/g,
        (match, handler) => {
          if (!handler.includes('React.MouseEvent') && !handler.includes('(e:')) {
            return `onClick={(e: React.MouseEvent) => ${handler}(e)}`;
          }
          return match;
        }
      );
      
      // Add proper typing for form handlers
      transformed = transformed.replace(
        /onSubmit=\{([^}]+)\}/g,
        (match, handler) => {
          if (!handler.includes('React.FormEvent') && !handler.includes('(e:')) {
            return `onSubmit={(e: React.FormEvent) => ${handler}(e)}`;
          }
          return match;
        }
      );
      
      // Add proper typing for change handlers
      transformed = transformed.replace(
        /onChange=\{([^}]+)\}/g,
        (match, handler) => {
          if (!handler.includes('React.ChangeEvent') && !handler.includes('(e:')) {
            return `onChange={(e: React.ChangeEvent<HTMLInputElement>) => ${handler}(e)}`;
          }
          return match;
        }
      );
      
      if (beforeAnyFix !== transformed) {
        changes++;
      }
    }

    // Add comprehensive error handling for async operations
    if (content.includes('async') && 
        content.includes('await') &&
        !content.includes('try') &&
        !content.includes('catch')) {
      
      const asyncFunctionMatch = content.match(/(const \w+ = async \([^)]*\) => {[\s\S]*?})/);
      if (asyncFunctionMatch) {
        const asyncFunction = asyncFunctionMatch[1];
        const wrappedFunction = asyncFunction.replace(
          /(async \([^)]*\) => {)([\s\S]*)(})/,
          '$1\n    try {$2\n    } catch (error) {\n      console.error("Error:", error);\n      // Handle error appropriately\n    }\n  $3'
        );
        transformed = transformed.replace(asyncFunction, wrappedFunction);
        changes++;
      }
    }

    // Add error handling for fetch operations
    if (content.includes('fetch(') && !content.includes('.catch(')) {
      const fetchMatches = content.match(/fetch\([^)]+\)(?!\s*\.catch)/g);
      if (fetchMatches) {
        fetchMatches.forEach(fetchCall => {
          transformed = transformed.replace(
            fetchCall,
            `${fetchCall}.catch(error => {
              console.error('Fetch error:', error);
              throw error;
            })`
          );
        });
        changes++;
      }
    }

    // Clean up code structure - remove duplicate exports
    const exportMatches = content.match(/export default \w+;/g) || [];
    if (exportMatches.length > 1) {
      // Keep only the last export default
      exportMatches.slice(0, -1).forEach(exportStatement => {
        transformed = transformed.replace(exportStatement, '');
      });
      changes++;
    }

    // Remove duplicate imports
    const importLines = transformed.split('\n').filter(line => line.trim().startsWith('import '));
    const uniqueImports = [...new Set(importLines)];
    
    if (importLines.length !== uniqueImports.length) {
      const seenImports = new Set();
      const lines = transformed.split('\n');
      
      const filteredLines = lines.filter(line => {
        if (line.trim().startsWith('import ')) {
          const importKey = line.trim();
          if (seenImports.has(importKey)) {
            return false;
          }
          seenImports.add(importKey);
        }
        return true;
      });
      
      transformed = filteredLines.join('\n');
      changes++;
    }

    // Clean up excessive whitespace
    const beforeWhitespace = transformed;
    transformed = transformed.replace(/\n\n\n+/g, '\n\n');
    if (beforeWhitespace !== transformed) {
      changes++;
    }

    // Add test utilities if test files detected
    if (content.includes('test(') || content.includes('describe(')) {
      
      // Add React Testing Library imports if missing
      if (!content.includes('@testing-library/react') && content.includes('render(')) {
        const importStatement = "import { render, screen, fireEvent } from '@testing-library/react';\n";
        transformed = importStatement + transformed;
        changes++;
      }

      // Add jest-dom imports if missing
      if (!content.includes('@testing-library/jest-dom') && content.includes('toBeInTheDocument')) {
        const importStatement = "import '@testing-library/jest-dom';\n";
        transformed = importStatement + transformed;
        changes++;
      }

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
