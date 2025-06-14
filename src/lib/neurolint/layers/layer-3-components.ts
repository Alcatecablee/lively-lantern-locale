
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  console.log('Layer 3 (Components) input length:', code.length);
  console.log('Layer 3 (Components) input sample:', code.substring(0, 200));
  
  // Add missing imports first
  transformed = addMissingImports(transformed);
  
  // Add missing key props for map operations
  transformed = addMissingKeyProps(transformed);
  
  // Convert var to const/let
  transformed = convertVarToConst(transformed);
  
  // Add TypeScript interfaces for props
  transformed = addTypeScriptInterfaces(transformed);
  
  // Add accessibility attributes
  transformed = addAccessibilityAttributes(transformed);
  
  // Remove duplicate functions
  transformed = removeDuplicateFunctions(transformed);
  
  console.log('Layer 3 (Components) output length:', transformed.length);
  console.log('Layer 3 changes:', transformed !== code);
  console.log('Layer 3 (Components) output sample:', transformed.substring(0, 200));
  
  return transformed;
}

function addMissingImports(code: string): string {
  // Check if React hooks are used but not imported
  const hasUseState = code.includes('useState');
  const hasUseEffect = code.includes('useEffect');
  const hasReactImport = code.includes('import React') || code.includes("import { useState") || code.includes("import { useEffect");
  
  if ((hasUseState || hasUseEffect) && !hasReactImport) {
    const imports = [];
    if (hasUseState) imports.push('useState');
    if (hasUseEffect) imports.push('useEffect');
    
    const importStatement = `import { ${imports.join(', ')} } from 'react';\n`;
    return importStatement + code;
  }
  
  return code;
}

function addMissingKeyProps(code: string): string {
  // Look for map operations without key props
  const mapPattern = /(\w+)\.map\s*\(\s*(\w+)\s*=>\s*\(\s*<(\w+)([^>]*)>/g;
  
  return code.replace(mapPattern, (match, array, item, tag, attributes) => {
    // Check if key prop already exists
    if (attributes.includes('key=')) {
      return match;
    }
    
    // Add key prop
    const keyProp = ` key={${item}.id || ${item}.name || Math.random()}`;
    return match.replace(`<${tag}${attributes}>`, `<${tag}${keyProp}${attributes}>`);
  });
}

function convertVarToConst(code: string): string {
  // Convert var declarations to const (simple cases)
  let fixed = code;
  
  // Match var declarations and convert to const
  fixed = fixed.replace(/\bvar\s+(\w+)\s*=/g, 'const $1 =');
  
  return fixed;
}

function addTypeScriptInterfaces(code: string): string {
  // Look for function components with props parameter
  const functionPattern = /function\s+(\w+)\s*\(\s*\{\s*([^}]+)\s*\}\s*\)/g;
  
  let result = code;
  const matches = [...code.matchAll(functionPattern)];
  
  for (const match of matches) {
    const componentName = match[1];
    const propsContent = match[2];
    
    // Create interface
    const interfaceName = `${componentName}Props`;
    const interfaceDeclaration = `interface ${interfaceName} {\n  ${propsContent.split(',').map(prop => prop.trim() + ': any').join(';\n  ')};\n}\n\n`;
    
    // Replace function signature
    const newFunctionSignature = `function ${componentName}({ ${propsContent} }: ${interfaceName})`;
    
    result = interfaceDeclaration + result.replace(match[0], newFunctionSignature);
  }
  
  return result;
}

function addAccessibilityAttributes(code: string): string {
  let fixed = code;
  
  // Add alt attributes to img tags
  fixed = fixed.replace(/<img\s+([^>]*?)(?<!alt="[^"]*")\s*>/g, '<img $1 alt="" >');
  
  // Add aria-label to buttons without text content
  fixed = fixed.replace(/<button\s+([^>]*?)>/g, (match, attributes) => {
    if (!attributes.includes('aria-label') && !match.includes('>')) {
      return `<button aria-label="Button" ${attributes}>`;
    }
    return match;
  });
  
  return fixed;
}

function removeDuplicateFunctions(code: string): string {
  const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\}/g;
  const functions = new Map();
  
  let result = code;
  const matches = [...code.matchAll(functionPattern)];
  
  for (const match of matches) {
    const functionName = match[1];
    const fullFunction = match[0];
    
    if (functions.has(functionName)) {
      // Remove duplicate
      result = result.replace(fullFunction, '');
    } else {
      functions.set(functionName, fullFunction);
    }
  }
  
  return result;
}
