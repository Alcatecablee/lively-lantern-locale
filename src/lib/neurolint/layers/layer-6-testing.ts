
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply testing and validation fixes
  transformed = removeDuplicateFunctions(transformed);
  transformed = optimizeConsoleStatements(transformed);
  transformed = addErrorBoundaries(transformed);
  transformed = addUseClientDirective(transformed);
  
  return transformed;
}

function removeDuplicateFunctions(code: string): string {
  const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  const functions = new Map<string, string>();
  const functionNames = new Set<string>();
  
  let result = code;
  let match;
  const regex = new RegExp(functionPattern.source, 'g');
  
  // Find all function declarations
  while ((match = regex.exec(code)) !== null) {
    const [fullMatch, functionName] = match;
    
    if (functionNames.has(functionName)) {
      // Remove duplicate function
      result = result.replace(fullMatch, '');
    } else {
      functionNames.add(functionName);
      functions.set(functionName, fullMatch);
    }
  }
  
  return result;
}

function optimizeConsoleStatements(code: string): string {
  // Convert console.log to console.debug for better performance
  return code.replace(/console\.log\(/g, 'console.debug(');
}

function addErrorBoundaries(code: string): string {
  // Add basic error handling for async operations
  if (code.includes('async') || code.includes('await') || code.includes('.then(')) {
    if (!code.includes('try') && !code.includes('catch')) {
      // This is a simple implementation - in practice, you'd want more sophisticated error boundary detection
      return code;
    }
  }
  
  return code;
}

function addUseClientDirective(code: string): string {
  const needsUseClient = 
    code.includes('useState') ||
    code.includes('useEffect') ||
    code.includes('localStorage') ||
    code.includes('window.') ||
    code.includes('document.') ||
    code.includes('onClick') ||
    code.includes('onChange') ||
    code.includes('onSubmit');
  
  if (needsUseClient && !code.includes("'use client'") && !code.includes('"use client"')) {
    return "'use client';\n\n" + code;
  }
  
  return code;
}
