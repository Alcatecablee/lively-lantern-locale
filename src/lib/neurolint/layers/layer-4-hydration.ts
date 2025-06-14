
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  console.log('Layer 4 (Hydration) input length:', code.length);
  
  // Apply hydration and SSR fixes
  transformed = addSSRGuards(transformed);
  transformed = fixHydrationIssues(transformed);
  
  console.log('Layer 4 (Hydration) output length:', transformed.length);
  console.log('Layer 4 changes:', transformed !== code);
  
  return transformed;
}

function addSSRGuards(code: string): string {
  let fixed = code;
  
  // Add SSR guards for localStorage.getItem calls
  if (code.includes('localStorage.getItem')) {
    fixed = fixed.replace(
      /localStorage\.getItem\(([^)]+)\)/g,
      'typeof window !== "undefined" ? localStorage.getItem($1) : null'
    );
  }
  
  // Add SSR guards for localStorage.setItem calls
  if (code.includes('localStorage.setItem')) {
    fixed = fixed.replace(
      /localStorage\.setItem\(([^)]+)\)/g,
      'typeof window !== "undefined" && localStorage.setItem($1)'
    );
  }
  
  // Add SSR guards for window object access
  if (code.includes('window.') && !code.includes('typeof window')) {
    fixed = fixed.replace(
      /window\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      'typeof window !== "undefined" ? window.$1 : undefined'
    );
  }
  
  // Add SSR guards for document access
  if (code.includes('document.') && !code.includes('typeof document')) {
    fixed = fixed.replace(
      /document\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      'typeof document !== "undefined" ? document.$1 : undefined'
    );
  }
  
  return fixed;
}

function fixHydrationIssues(code: string): string {
  // Add mounted state for components that use localStorage or other client-only features
  if (code.includes('localStorage') || code.includes('window.') || code.includes('document.')) {
    if (code.includes('useState') && !code.includes('const [mounted, setMounted]')) {
      // Add mounted state and useEffect
      const mountedCode = `
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
`;
      
      // Insert after the first useState declaration
      const useStateMatch = code.match(/const\s+\[[^\]]+\]\s*=\s*useState\([^)]*\);/);
      if (useStateMatch) {
        const insertIndex = code.indexOf(useStateMatch[0]) + useStateMatch[0].length;
        return code.slice(0, insertIndex) + mountedCode + code.slice(insertIndex);
      }
    }
  }
  
  return code;
}
