
export async function transformAST(code: string): Promise<string> {
  console.log('Using simplified component transformations for MVP');
  
  let transformed = code;
  
  // Add missing imports (simple approach)
  if ((code.includes('useState') || code.includes('useEffect')) && !code.includes('import {')) {
    const imports = [];
    if (code.includes('useState')) imports.push('useState');
    if (code.includes('useEffect')) imports.push('useEffect');
    transformed = `import { ${imports.join(', ')} } from 'react';\n${transformed}`;
  }
  
  // Remove duplicate functions - enhanced detection
  transformed = removeDuplicateFunctions(transformed);
  
  // Add missing key props - improved regex
  transformed = addMissingKeyProps(transformed);
  
  // Convert var to const
  transformed = transformed.replace(/\bvar\s+/g, 'const ');
  
  // Add basic accessibility
  transformed = transformed.replace(/<img\s+([^>]*?)(?<!alt="[^"]*")\s*>/g, '<img $1 alt="" >');
  transformed = transformed.replace(/<button\s+([^>]*?)>/g, (match, attrs) => {
    if (attrs.includes('aria-label')) return match;
    return `<button aria-label="Button" ${attrs}>`;
  });
  
  // Add TypeScript interfaces for components with props
  if (transformed.includes('function') && transformed.includes('({ ') && !transformed.includes('interface')) {
    transformed = addBasicInterface(transformed);
  }
  
  console.log('Component transformations completed');
  return transformed;
}

function removeDuplicateFunctions(code: string): string {
  // Find all function declarations
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{[^}]*}/g;
  const functions = new Map();
  let result = code;
  
  let match;
  while ((match = functionRegex.exec(code)) !== null) {
    const functionName = match[1];
    const fullFunction = match[0];
    
    if (functions.has(functionName)) {
      // Remove the duplicate function
      result = result.replace(fullFunction, '');
      console.log(`Removed duplicate function: ${functionName}`);
    } else {
      functions.set(functionName, fullFunction);
    }
  }
  
  return result;
}

function addMissingKeyProps(code: string): string {
  // Enhanced key prop detection for map functions
  return code.replace(
    /(\w+)\.map\s*\(\s*(\w+)\s*=>\s*\(\s*<(\w+)([^>]*?)>/g,
    (match, array, item, tag, attributes) => {
      if (attributes.includes('key=')) return match;
      // Use item.id if available, otherwise use index
      const keyValue = `${item}.id || ${item}.name || Math.random()`;
      return match.replace(`<${tag}${attributes}>`, `<${tag} key={${keyValue}}${attributes}>`);
    }
  );
}

function addBasicInterface(code: string): string {
  // Add a basic Props interface for components that take props
  const componentMatch = code.match(/function\s+(\w+)\s*\(\s*{\s*([^}]+)\s*}\s*\)/);
  if (componentMatch) {
    const componentName = componentMatch[1];
    const props = componentMatch[2];
    const interfaceName = `${componentName}Props`;
    
    const interfaceCode = `interface ${interfaceName} {
  ${props.split(',').map(prop => `${prop.trim()}: any;`).join('\n  ')}
}

`;
    
    return interfaceCode + code.replace(
      `function ${componentName}({ ${props} })`,
      `function ${componentName}({ ${props} }: ${interfaceName})`
    );
  }
  
  return code;
}
