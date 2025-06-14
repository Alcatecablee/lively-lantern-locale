
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply hydration and SSR fixes
  transformed = addSSRGuards(transformed);
  transformed = fixHydrationIssues(transformed);
  
  return transformed;
}

function addSSRGuards(code: string): string {
  let fixed = code;
  
  // Add SSR guards for localStorage.getItem calls
  if (code.includes('localStorage.getItem') && !code.includes('typeof window !== "undefined"')) {
    fixed = fixed.replace(
      /localStorage\.getItem\(([^)]+)\)/g,
      'typeof window !== "undefined" ? localStorage.getItem($1) : null'
    );
  }
  
  // Add SSR guards for localStorage.setItem calls
  if (code.includes('localStorage.setItem') && !code.includes('typeof window !== "undefined"')) {
    fixed = fixed.replace(
      /localStorage\.setItem\(([^)]+)\)/g,
      'typeof window !== "undefined" && localStorage.setItem($1)'
    );
  }
  
  return fixed;
}

function fixHydrationIssues(code: string): string {
  // Add basic hydration fixes - could be expanded
  return code;
}
