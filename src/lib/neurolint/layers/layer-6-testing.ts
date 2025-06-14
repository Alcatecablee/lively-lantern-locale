
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply testing and validation fixes
  transformed = addErrorBoundaries(transformed);
  transformed = addPropValidation(transformed);
  transformed = addLoadingStates(transformed);
  transformed = validateExports(transformed);
  transformed = addPerformanceOptimizations(transformed);
  transformed = addErrorHandling(transformed);
  transformed = fixTypeScriptIssues(transformed);
  
  return transformed;
}

function addErrorBoundaries(code: string): string {
  // Add error boundaries for components that might fail
  if (code.includes('export default function') && 
      code.includes('useState') && 
      !code.includes('ErrorBoundary') &&
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
  
  return code;
}

function addErrorHandling(code: string): string {
  // Wrap async operations in try-catch
  if (code.includes('async') && 
      code.includes('await') &&
      !code.includes('try') &&
      !code.includes('catch')) {
    
    const asyncFunctionMatch = code.match(/(const \w+ = async \([^)]*\) => {[\s\S]*?})/);
    if (asyncFunctionMatch) {
      const asyncFunction = asyncFunctionMatch[1];
      const wrappedFunction = asyncFunction.replace(
        /(async \([^)]*\) => {)([\s\S]*)(})/,
        '$1\n    try {$2\n    } catch (error) {\n      console.error("Error:", error);\n      // Handle error appropriately\n    }\n  $3'
      );
      return code.replace(asyncFunction, wrappedFunction);
    }
  }
  
  return code;
}

function fixTypeScriptIssues(code: string): string {
  let fixed = code;
  
  // Replace 'any' with more specific types where possible
  fixed = fixed.replace(/:\s*any(?!\[\])/g, ': unknown');
  fixed = fixed.replace(/any\[\]/g, 'unknown[]');
  
  // Add proper typing for event handlers
  fixed = fixed.replace(
    /onClick=\{([^}]+)\}/g,
    (match, handler) => {
      if (!handler.includes('React.MouseEvent')) {
        return `onClick={(e: React.MouseEvent) => ${handler}(e)}`;
      }
      return match;
    }
  );
  
  return fixed;
}
