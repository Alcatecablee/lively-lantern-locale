export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply hydration and SSR fixes
  transformed = addSSRGuards(transformed);
  transformed = fixHydrationIssues(transformed);
  
  return transformed;
}

function addSSRGuards(code: string): string {
  let fixed = code;
  
  // Add SSR guards for localStorage access
  if (code.includes('localStorage.getItem') && !code.includes('typeof window !== "undefined"')) {
    fixed = fixed.replace(
      /localStorage\.getItem\(([^)]+)\)/g,
      'typeof window !== "undefined" ? localStorage.getItem($1) : null'
    );
  }
  
  if (code.includes('localStorage.setItem') && !code.includes('typeof window !== "undefined"')) {
    fixed = fixed.replace(
      /localStorage\.setItem\(([^)]+)\)/g,
      'typeof window !== "undefined" && localStorage.setItem($1)'
    );
  }
  
  return fixed;
}

function fixHydrationIssues(code: string): string {
  // Add basic hydration fixes
  return code;
}
