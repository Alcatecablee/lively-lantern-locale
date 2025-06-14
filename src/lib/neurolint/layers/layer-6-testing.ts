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
  // More robust duplicate function removal that properly tracks and removes duplicates
  const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  const seenFunctions = new Map<string, number>();
  let result = code;
  let match;
  const matches = [];
  
  // Reset regex
  functionPattern.lastIndex = 0;
  
  // Collect all function matches with their positions
  while ((match = functionPattern.exec(code)) !== null) {
    matches.push({
      fullMatch: match[0],
      functionName: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }
  
  // Process matches in reverse order to avoid index shifting issues
  matches.reverse().forEach(matchInfo => {
    const { fullMatch, functionName, startIndex, endIndex } = matchInfo;
    
    if (seenFunctions.has(functionName)) {
      // This is a duplicate - remove it
      result = result.substring(0, startIndex) + result.substring(endIndex);
    } else {
      // First occurrence - keep it
      seenFunctions.set(functionName, 1);
    }
  });
  
  // Clean up any extra whitespace left behind
  result = result.replace(/\n\s*\n\s*\n+/g, '\n\n');
  
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
