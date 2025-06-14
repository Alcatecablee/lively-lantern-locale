export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  console.log('Layer 6 (Testing) input length:', code.length);
  
  // Apply testing and validation enhancements
  transformed = removeDuplicateFunctions(transformed);
  transformed = addErrorBoundaries(transformed);
  transformed = addLoadingStates(transformed);
  
  console.log('Layer 6 (Testing) output length:', transformed.length);
  console.log('Layer 6 changes:', transformed !== code);
  
  return transformed;
}

function removeDuplicateFunctions(code: string): string {
  // Find and remove duplicate function declarations
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  const seenFunctions = new Map<string, string>();
  const duplicatePositions: Array<{start: number, end: number}> = [];
  
  let match;
  const regex = new RegExp(functionRegex);
  
  // First pass: identify all functions and mark duplicates
  while ((match = regex.exec(code)) !== null) {
    const functionName = match[1];
    const fullFunction = match[0];
    const start = match.index;
    const end = match.index + fullFunction.length;
    
    if (seenFunctions.has(functionName)) {
      // This is a duplicate, mark for removal
      duplicatePositions.push({start, end});
    } else {
      // First occurrence, keep it
      seenFunctions.set(functionName, fullFunction);
    }
  }
  
  // Remove duplicates from the end to the beginning to maintain correct positions
  let result = code;
  duplicatePositions.reverse().forEach(duplicate => {
    result = result.slice(0, duplicate.start) + result.slice(duplicate.end);
  });
  
  return result;
}

function addErrorBoundaries(code: string): string {
  // Add basic error handling where appropriate
  if (code.includes('useState') && !code.includes('try') && code.includes('fetch')) {
    // Add try-catch around fetch calls
    return code.replace(
      /fetch\(([^)]+)\)/g,
      'await fetch($1).catch(error => { console.error("Fetch error:", error); throw error; })'
    );
  }
  return code;
}

function addLoadingStates(code: string): string {
  // Add loading state management where appropriate
  if (code.includes('useState') && code.includes('useEffect') && !code.includes('loading')) {
    // Add loading state
    return code.replace(
      /const \[([^,]+),\s*set([^\]]+)\]\s*=\s*useState\(([^)]+)\);/,
      'const [$1, set$2] = useState($3);\n  const [loading, setLoading] = useState(false);'
    );
  }
  return code;
}
