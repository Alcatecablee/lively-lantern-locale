

export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply component-specific fixes in safe order
  transformed = addMissingImports(transformed);
  transformed = fixMissingKeyProps(transformed);
  transformed = fixAccessibilityAttributes(transformed);
  transformed = fixComponentPropTypes(transformed);
  transformed = convertVarToConst(transformed);
  transformed = addUseClientDirective(transformed);
  
  return transformed;
}

function addMissingImports(code: string): string {
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

function fixMissingKeyProps(code: string): string {
  // Fix map operations without keys - more robust pattern
  return code.replace(
    /(\w+)\.map\(\s*\(?\s*(\w+)(?:\s*,\s*(\w+))?\s*\)?\s*=>\s*\(\s*<(\w+)([^>]*?)(?:\s*\/?>|>[^<]*<\/\4>)/g,
    (match, arrayName, item, index, component, props) => {
      if (props.includes('key=')) return match;
      
      const keyValue = index ? `{${index}}` : `{${item}.id || ${item}.name || Math.random()}`;
      
      if (match.includes('/>')) {
        return match.replace(`<${component}${props}`, `<${component} key=${keyValue}${props}`);
      } else {
        return match.replace(`<${component}${props}>`, `<${component} key=${keyValue}${props}>`);
      }
    }
  );
}

function fixAccessibilityAttributes(code: string): string {
  let fixed = code;
  
  // Add alt attributes to images - don't modify if already has alt
  fixed = fixed.replace(
    /<img([^>]*?)(?:\s*\/?>)/g,
    (match, attributes) => {
      if (!attributes.includes('alt=')) {
        return `<img${attributes} alt="" />`;
      }
      return match;
    }
  );
  
  // Add aria-label to buttons without accessible text - only for simple buttons
  fixed = fixed.replace(
    /<button([^>]*?)>([^<]*)<\/button>/g,
    (match, attributes, content) => {
      // Only add aria-label if no existing accessibility attributes and no text content
      if (!attributes.includes('aria-label') && 
          !attributes.includes('aria-labelledby') && 
          !content.trim()) {
        return `<button${attributes} aria-label="Button">${content}</button>`;
      }
      return match;
    }
  );
  
  return fixed;
}

function fixComponentPropTypes(code: string): string {
  // Add TypeScript interface for components with props
  const componentMatch = code.match(/function\s+(\w+)\(\s*{\s*([^}]+)\s*}/);
  if (componentMatch && !code.includes('interface') && !code.includes('type Props')) {
    const [, componentName, props] = componentMatch;
    const propNames = props.split(',').map(p => p.trim().split(':')[0].trim());
    
    const interfaceDefinition = `interface ${componentName}Props {
  ${propNames.map(prop => `${prop}: any;`).join('\n  ')}
}

`;
    
    return interfaceDefinition + code.replace(
      `function ${componentName}({ ${props} }`,
      `function ${componentName}({ ${props} }: ${componentName}Props`
    );
  }
  
  return code;
}

function convertVarToConst(code: string): string {
  // Convert var declarations to const (simple cases)
  return code.replace(/\bvar\s+(\w+)\s*=\s*([^;]+);/g, 'const $1 = $2;');
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

