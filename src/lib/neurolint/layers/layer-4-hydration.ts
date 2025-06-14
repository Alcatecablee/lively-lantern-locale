
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply hydration-specific fixes
  transformed = addSSRGuards(transformed);
  transformed = fixThemeProviderHydration(transformed);
  transformed = fixClientOnlyComponents(transformed);
  transformed = addMountedStates(transformed);
  transformed = fixLocalStorageAccess(transformed);
  
  return transformed;
}

function addSSRGuards(code: string): string {
  let fixed = code;
  
  // Fix localStorage access
  fixed = fixed.replace(
    /localStorage\.getItem\(/g,
    'typeof window !== "undefined" && localStorage.getItem('
  );
  
  fixed = fixed.replace(
    /localStorage\.setItem\(/g,
    'typeof window !== "undefined" && localStorage.setItem('
  );
  
  // Fix window access
  fixed = fixed.replace(
    /window\.matchMedia\(/g,
    'typeof window !== "undefined" && window.matchMedia('
  );
  
  fixed = fixed.replace(
    /window\.location/g,
    'typeof window !== "undefined" && window.location'
  );
  
  // Fix document access
  fixed = fixed.replace(
    /document\.documentElement/g,
    'typeof document !== "undefined" && document.documentElement'
  );
  
  fixed = fixed.replace(
    /document\.body/g,
    'typeof document !== "undefined" && document.body'
  );
  
  return fixed;
}

function fixThemeProviderHydration(code: string): string {
  // Fix theme providers that might cause hydration mismatches
  if (code.includes('ThemeProvider') && code.includes('useState') && !code.includes('mounted')) {
    return code.replace(
      /const \[theme, setTheme\] = useState<Theme>\('light'\);/,
      `const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);`
    ).replace(
      /return \(\s*<ThemeContext\.Provider/,
      `if (!mounted) {
    return <ThemeContext.Provider value={{ theme: 'light', setTheme: () => {} }}>{children}</ThemeContext.Provider>;
  }

  return (
    <ThemeContext.Provider`
    );
  }
  
  return code;
}

function fixClientOnlyComponents(code: string): string {
  // Add 'use client' directive to components that need it
  const needsUseClient = 
    code.includes('useState') ||
    code.includes('useEffect') ||
    code.includes('useCallback') ||
    code.includes('useMemo') ||
    code.includes('useContext') ||
    code.includes('useReducer') ||
    code.includes('useRef') ||
    code.includes('localStorage') ||
    code.includes('window.') ||
    code.includes('document.');
  
  if (needsUseClient && !code.includes("'use client'") && !code.includes('"use client"')) {
    return "'use client';\n\n" + code;
  }
  
  return code;
}

function addMountedStates(code: string): string {
  // Add mounted states to components that access client-only APIs
  if ((code.includes('localStorage') || code.includes('window.')) && 
      !code.includes('mounted') && 
      code.includes('useState')) {
    
    const stateMatch = code.match(/const \[([^,]+),\s*set[^\]]+\] = useState/);
    if (stateMatch) {
      return code.replace(
        stateMatch[0],
        `const [mounted, setMounted] = useState(false);\n  ${stateMatch[0]}`
      ).replace(
        /useEffect\(\(\) => \{/,
        `useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;`
      );
    }
  }
  
  return code;
}

function fixLocalStorageAccess(code: string): string {
  // Wrap localStorage operations in useEffect with mounted checks
  if (code.includes('localStorage') && code.includes('useEffect')) {
    return code.replace(
      /useEffect\(\(\) => \{[\s\S]*?localStorage/g,
      (match) => {
        if (!match.includes('if (typeof window === "undefined")')) {
          return match.replace(
            'useEffect(() => {',
            'useEffect(() => {\n    if (typeof window === "undefined") return;'
          );
        }
        return match;
      }
    );
  }
  
  return code;
}
