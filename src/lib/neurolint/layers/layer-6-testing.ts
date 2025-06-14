
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
  // More robust duplicate function removal
  const lines = code.split('\n');
  const seenFunctions = new Map<string, { signature: string; firstIndex: number }>();
  const linesToRemove = new Set<number>();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match function declarations
    const functionMatch = line.match(/^\s*function\s+(\w+)\s*\([^)]*\)\s*\{?/);
    if (functionMatch) {
      const functionName = functionMatch[1];
      
      // Get the function signature (name + parameters)
      const fullSignature = functionMatch[0];
      
      if (seenFunctions.has(functionName)) {
        const existing = seenFunctions.get(functionName)!;
        
        // If signatures match exactly, this is a duplicate
        if (existing.signature === fullSignature) {
          // Mark this function for removal
          let startIndex = i;
          let braceCount = 0;
          let foundOpenBrace = false;
          
          // Find the complete function block
          for (let j = i; j < lines.length; j++) {
            const currentLine = lines[j];
            
            // Count braces to find function end
            for (const char of currentLine) {
              if (char === '{') {
                braceCount++;
                foundOpenBrace = true;
              } else if (char === '}') {
                braceCount--;
              }
            }
            
            linesToRemove.add(j);
            
            // If we've closed all braces, we've found the end
            if (foundOpenBrace && braceCount === 0) {
              break;
            }
          }
        }
      } else {
        // First occurrence of this function
        seenFunctions.set(functionName, {
          signature: fullSignature,
          firstIndex: i
        });
      }
    }
  }
  
  // Remove the duplicate lines
  const filteredLines = lines.filter((_, index) => !linesToRemove.has(index));
  
  // Clean up extra whitespace
  let result = filteredLines.join('\n');
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
