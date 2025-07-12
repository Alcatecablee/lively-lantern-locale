
export async function transform(code: string, filePath?: string): Promise<string> {
  let transformed = code;
  
  // Apply testing and validation fixes in order of importance
  transformed = addErrorBoundaries(transformed);
  transformed = addPropValidation(transformed);
  transformed = addLoadingStates(transformed);
  transformed = validateExports(transformed);
  transformed = addAccessibilityAttributes(transformed);
  transformed = addPerformanceOptimizations(transformed);
  transformed = validateCircularDependencies(transformed, filePath);
  transformed = fixTypeScriptStrictMode(transformed);
  transformed = addErrorHandling(transformed);
  transformed = cleanupCodeStructure(transformed);
  
  return transformed;
}

function addErrorBoundaries(code: string): string {
  // Add error boundaries for components that might fail
  if (code.includes('export default function') && 
      code.includes('useState') && 
      !code.includes('ErrorBoundary') &&
      !code.includes('componentDidCatch') &&
      (code.includes('PDF') || code.includes('upload') || code.includes('API') || code.includes('fetch'))) {
    
    const componentMatch = code.match(/export default function (\w+)/);
    if (componentMatch) {
      const componentName = componentMatch[1];
      
      const errorBoundaryWrapper = `function ${componentName}WithErrorBoundary(props: any) {
  try {
    return <${componentName} {...props} />;
  } catch (error) {
    console.error('Component error:', error);
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200">
        <h3 className="font-semibold">Something went wrong</h3>
        <p className="text-sm mt-1">Please try again later.</p>
      </div>
    );
  }
}

`;
      
      return code.replace(
        `export default function ${componentName}`,
        `${errorBoundaryWrapper}function ${componentName}`
      ) + `\n\nexport default ${componentName}WithErrorBoundary;`;
    }
  }
  
  return code;
}

function addPropValidation(code: string): string {
  // Add interface definitions for components missing them
  const componentMatch = code.match(/export default function (\w+)\(\s*{\s*([^}]+)\s*}/);
  if (componentMatch && !code.includes('interface') && !code.includes('type Props')) {
    const [, componentName, props] = componentMatch;
    const propNames = props.split(',').map(p => p.trim().split(':')[0].trim());
    
    const interfaceDefinition = `interface ${componentName}Props {
  ${propNames.map(prop => `${prop}: any; // TODO: Define proper type`).join('\n  ')}
}

`;
    
    return interfaceDefinition + code.replace(
      `export default function ${componentName}({ ${props} }`,
      `export default function ${componentName}({ ${props} }: ${componentName}Props`
    );
  }
  
  return code;
}

function addLoadingStates(code: string): string {
  // Add loading states for async operations
  if (code.includes('async') && 
      code.includes('useState') &&
      !code.includes('loading') &&
      !code.includes('isLoading')) {
    
    const stateMatch = code.match(/const \[([^,]+),\s*set[^\]]+\] = useState/);
    if (stateMatch) {
      return code.replace(
        stateMatch[0],
        `const [isLoading, setIsLoading] = useState(false);\n  ${stateMatch[0]}`
      );
    }
  }
  
  return code;
}

function validateExports(code: string): string {
  // Ensure components have proper default exports
  const functionMatch = code.match(/function (\w+)\s*\(/);
  if (functionMatch && !code.includes(`export default ${functionMatch[1]}`) && !code.includes('export default function')) {
    return code + `\n\nexport default ${functionMatch[1]};`;
  }
  
  return code;
}

function addAccessibilityAttributes(code: string): string {
  let fixed = code;
  
  // Add basic accessibility attributes to buttons without them
  if (code.includes('<button') && 
      !code.includes('aria-label') &&
      !code.includes('aria-describedby')) {
    
    fixed = fixed.replace(
      /<button([^>]*?)>/g,
      (match, attributes) => {
        if (!attributes.includes('aria-label')) {
          return `<button${attributes} aria-label="Button">`;
        }
        return match;
      }
    );
  }
  
  // Add alt text to images without them
  if (code.includes('<img') && !code.includes('alt=')) {
    fixed = fixed.replace(
      /<img([^>]*?)>/g,
      (match, attributes) => {
        if (!attributes.includes('alt=')) {
          return `<img${attributes} alt="Image">`;
        }
        return match;
      }
    );
  }
  
  // Add role attributes to interactive elements
  if (code.includes('<div') && code.includes('onClick')) {
    fixed = fixed.replace(
      /<div([^>]*?)onClick/g,
      (match, attributes) => {
        if (!attributes.includes('role=')) {
          return `<div${attributes} role="button" onClick`;
        }
        return match;
      }
    );
  }
  
  return fixed;
}

function addPerformanceOptimizations(code: string): string {
  // Add React.memo for pure components
  if (code.includes('export default function') && 
      !code.includes('useState') &&
      !code.includes('useEffect') &&
      !code.includes('React.memo') &&
      code.includes('props')) {
    
    const componentMatch = code.match(/export default function (\w+)/);
    if (componentMatch) {
      const componentName = componentMatch[1];
      return code.replace(
        `export default function ${componentName}`,
        `const ${componentName} = React.memo(function ${componentName}`
      ).replace(
        /}\s*$/, 
        '});\n\nexport default ' + componentName + ';'
      );
    }
  }
  
  // Add useMemo for expensive computations
  if (code.includes('useState') && 
      code.includes('.map(') && 
      !code.includes('useMemo')) {
    
    // Look for expensive array operations
    const expensiveOperations = code.match(/const\s+(\w+)\s+=\s+[^.]+\.map\([^)]+\)/g);
    if (expensiveOperations) {
      let optimized = code;
      expensiveOperations.forEach(operation => {
        const variableName = operation.match(/const\s+(\w+)\s+=/)?.[1];
        if (variableName) {
          optimized = optimized.replace(
            operation,
            `const ${variableName} = useMemo(() => ${operation.replace(/const\s+\w+\s+=\s+/, '')}, [])`
          );
        }
      });
      return optimized;
    }
  }
  
  return code;
}

function validateCircularDependencies(code: string, filePath?: string): string {
  if (!filePath) return code;
  
  const imports = code.match(/import.*from ['"]([^'"]+)['"]/g) || [];
  const currentDir = filePath.split('/').slice(0, -1).join('/');
  const currentFileName = filePath.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '');
  
  const hasCircularDependency = imports.some(imp => {
    const importPath = imp.match(/from ['"]([^'"]+)['"]/)?.[1];
    if (importPath && importPath.startsWith('.')) {
      // Resolve relative path
      const resolvedPath = importPath.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '');
      return resolvedPath === currentFileName;
    }
    return false;
  });
  
  if (hasCircularDependency) {
    return `// Warning: Potential circular dependency detected\n// Consider refactoring to avoid circular imports\n\n${code}`;
  }
  
  return code;
}

function fixTypeScriptStrictMode(code: string): string {
  let fixed = code;
  
  // Replace 'any' with more specific types where possible
  fixed = fixed.replace(/:\s*any(?!\[\])/g, ': unknown');
  fixed = fixed.replace(/any\[\]/g, 'unknown[]');
  
  // Add proper typing for event handlers
  fixed = fixed.replace(
    /onClick=\{([^}]+)\}/g,
    (match, handler) => {
      if (!handler.includes('React.MouseEvent') && !handler.includes('(e:')) {
        return `onClick={(e: React.MouseEvent) => ${handler}(e)}`;
      }
      return match;
    }
  );
  
  // Add proper typing for form handlers
  fixed = fixed.replace(
    /onSubmit=\{([^}]+)\}/g,
    (match, handler) => {
      if (!handler.includes('React.FormEvent') && !handler.includes('(e:')) {
        return `onSubmit={(e: React.FormEvent) => ${handler}(e)}`;
      }
      return match;
    }
  );
  
  // Add proper typing for change handlers
  fixed = fixed.replace(
    /onChange=\{([^}]+)\}/g,
    (match, handler) => {
      if (!handler.includes('React.ChangeEvent') && !handler.includes('(e:')) {
        return `onChange={(e: React.ChangeEvent<HTMLInputElement>) => ${handler}(e)}`;
      }
      return match;
    }
  );
  
  return fixed;
}

function addErrorHandling(code: string): string {
  // Wrap async operations in try-catch
  if (code.includes('async') && 
      code.includes('await') &&
      !code.includes('try') &&
      !code.includes('catch')) {
    
    const asyncFunctionMatch = code.match(/(const \w+ = async \([^)]*\) => {[\s\S]*?^  })/m);
    if (asyncFunctionMatch) {
      const asyncFunction = asyncFunctionMatch[1];
      const wrappedFunction = asyncFunction.replace(
        /(async \([^)]*\) => {)([\s\S]*)(^  })/m,
        '$1\n    try {$2\n    } catch (error) {\n      console.error("Error:", error);\n      // Handle error appropriately\n    }\n  $3'
      );
      return code.replace(asyncFunction, wrappedFunction);
    }
  }
  
  // Add error handling for fetch operations
  if (code.includes('fetch(') && !code.includes('.catch(')) {
    const fetchMatches = code.match(/fetch\([^)]+\)(?!\s*\.catch)/g);
    if (fetchMatches) {
      let enhanced = code;
      fetchMatches.forEach(fetchCall => {
        enhanced = enhanced.replace(
          fetchCall,
          `${fetchCall}.catch(error => {
            console.error('Fetch error:', error);
            throw error;
          })`
        );
      });
      return enhanced;
    }
  }
  
  return code;
}

function cleanupCodeStructure(code: string): string {
  let cleaned = code;
  
  // Remove duplicate exports
  const exportMatches = code.match(/export default \w+;/g) || [];
  if (exportMatches.length > 1) {
    // Keep only the last export default
    const lastExport = exportMatches[exportMatches.length - 1];
    
    exportMatches.slice(0, -1).forEach(exportStatement => {
      cleaned = cleaned.replace(exportStatement, '');
    });
  }
  
  // Remove duplicate imports
  const importLines = cleaned.split('\n').filter(line => line.trim().startsWith('import '));
  const uniqueImports = [...new Set(importLines)];
  
  if (importLines.length !== uniqueImports.length) {
    let deduped = cleaned;
    const seenImports = new Set();
    const lines = cleaned.split('\n');
    
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
    
    cleaned = filteredLines.join('\n');
  }
  
  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n\n\n+/g, '\n\n');
  
  return cleaned;
}
