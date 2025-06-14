
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  console.log('Layer 6 (Testing) input length:', code.length);
  
  // Optimize console statements
  transformed = optimizeConsoleStatements(transformed);
  
  // Add error boundaries (basic)
  transformed = addBasicErrorHandling(transformed);
  
  console.log('Layer 6 (Testing) output length:', transformed.length);
  console.log('Layer 6 changes:', transformed !== code);
  
  return transformed;
}

function optimizeConsoleStatements(code: string): string {
  // Convert console.log to console.debug in production-like code
  let fixed = code;
  
  // Only convert console.log, preserve console.error, console.warn
  fixed = fixed.replace(/console\.log\(/g, 'console.debug(');
  
  return fixed;
}

function addBasicErrorHandling(code: string): string {
  // Add basic try-catch around risky operations (simplified)
  let fixed = code;
  
  // Wrap localStorage calls in try-catch if not already wrapped
  if (fixed.includes('localStorage') && !fixed.includes('try')) {
    fixed = fixed.replace(
      /(localStorage\.[gs]etItem\([^)]+\))/g,
      'try { $1 } catch (e) { console.warn("localStorage error:", e); }'
    );
  }
  
  return fixed;
}
