
export function addMissingImports(code: string): string {
  const existingImports = code.match(/import.*from.*['"][^'"]+['"]/g) || [];
  const existingImportText = existingImports.join(' ');
  const imports = new Set<string>();
  
  // Check for React hooks
  const hookPattern = /use(State|Effect|Callback|Memo|Ref|Context|Reducer|ImperativeHandle|LayoutEffect|DebugValue)\(/;
  if (hookPattern.test(code) && !existingImportText.includes('react')) {
    const hooks = [];
    if (code.includes('useState(')) hooks.push('useState');
    if (code.includes('useEffect(')) hooks.push('useEffect');
    if (code.includes('useCallback(')) hooks.push('useCallback');
    if (code.includes('useMemo(')) hooks.push('useMemo');
    if (code.includes('useRef(')) hooks.push('useRef');
    
    if (hooks.length > 0) {
      imports.add(`import { ${hooks.join(', ')} } from 'react';`);
    }
  }
  
  if (imports.size > 0) {
    const importStatements = Array.from(imports).join('\n');
    return importStatements + '\n\n' + code;
  }
  
  return code;
}
