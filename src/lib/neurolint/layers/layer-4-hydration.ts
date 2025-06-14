
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply hydration-specific fixes safely
  transformed = addSSRGuards(transformed);
  transformed = addMountedStates(transformed);
  transformed = addUseClientDirective(transformed);
  
  return transformed;
}

function addSSRGuards(code: string): string {
  let fixed = code;
  
  // Fix localStorage access with proper guards
  fixed = fixed.replace(
    /localStorage\.getItem\(/g,
    'typeof window !== "undefined" && localStorage.getItem('
  );
  
  fixed = fixed.replace(
    /localStorage\.setItem\(/g,
    'typeof window !== "undefined" && localStorage.setItem('
  );
  
  return fixed;
}

function addMountedStates(code: string): string {
  // Add mounted state for components using localStorage
  if (code.includes('localStorage') && code.includes('useState') && !code.includes('mounted')) {
    // Add mounted state
    const statePattern = /const \[([^,]+),\s*set[^\]]+\] = useState/;
    const match = code.match(statePattern);
    
    if (match) {
      let result = code.replace(
        match[0],
        `const [mounted, setMounted] = useState(false);\n  ${match[0]}`
      );
      
      // Add useEffect for mounted state
      if (!result.includes('setMounted(true)')) {
        const useEffectPattern = /useEffect\(\(\) => \{/;
        if (useEffectPattern.test(result)) {
          result = result.replace(
            useEffectPattern,
            'useEffect(() => {\n    setMounted(true);\n  }, []);\n\n  useEffect(() => {\n    if (!mounted) return;'
          );
        }
      }
      
      return result;
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
