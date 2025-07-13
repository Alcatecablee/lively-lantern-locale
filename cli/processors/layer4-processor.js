
// Layer 4: Hydration & SSR Guards Processor
// Integrates with fix-layer-4-hydration.js patterns

class Layer4Processor {
  static processHydration(content) {
    let transformed = content;
    let changes = 0;

    // Add SSR guards for localStorage
    const localStoragePattern = /localStorage\.(getItem|setItem|removeItem)\(/g;
    const beforeLocalStorage = transformed;
    transformed = transformed.replace(localStoragePattern, (match, method) => {
      changes++;
      return `typeof window !== "undefined" && localStorage.${method}(`;
    });

    // Add SSR guards for window object
    const windowPattern = /\bwindow\./g;
    const beforeWindow = transformed;
    transformed = transformed.replace(windowPattern, (match) => {
      if (!transformed.substring(0, transformed.indexOf(match)).includes('typeof window !== "undefined"')) {
        changes++;
        return 'typeof window !== "undefined" && window.';
      }
      return match;
    });

    // Add mounted state for hydration-sensitive components
    if (content.includes('useState') && content.includes('localStorage') && !content.includes('mounted')) {
      const mountedState = `
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null; // or loading spinner
  }
`;
      
      // Insert after first useState
      const useStateIndex = transformed.indexOf('useState');
      if (useStateIndex !== -1) {
        const lineEnd = transformed.indexOf('\n', useStateIndex);
        transformed = transformed.slice(0, lineEnd + 1) + mountedState + transformed.slice(lineEnd + 1);
        changes++;
      }
    }

    return transformed;
  }
}

module.exports = Layer4Processor;
