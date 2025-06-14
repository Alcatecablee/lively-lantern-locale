
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
  
  // Add basic accessibility - fixed img tag regex
  transformed = transformed.replace(/<img\s+([^>]*?)(?<!alt="[^"]*")\s*\/?>/g, (match, attrs) => {
    if (attrs.includes('alt=')) return match;
    return `<img ${attrs} alt="" />`;
  });
  
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
  // Find all function declarations with their positions
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\}/g;
  const functions = new Map();
  const toRemove = [];
  
  let match;
  while ((match = functionRegex.exec(code)) !== null) {
    const functionName = match[1];
    const fullFunction = match[0];
    const startIndex = match.index;
    const endIndex = match.index + fullFunction.length;
    
    if (functions.has(functionName)) {
      // Mark this duplicate for removal
      toRemove.push({ start: startIndex, end: endIndex, text: fullFunction });
      console.log(`Found duplicate function: ${functionName}`);
    } else {
      functions.set(functionName, { text: fullFunction, start: startIndex, end: endIndex });
    }
  }
  
  // Remove duplicates from end to start to preserve indices
  toRemove.sort((a, b) => b.start - a.start);
  let result = code;
  
  for (const duplicate of toRemove) {
    result = result.substring(0, duplicate.start) + result.substring(duplicate.end);
    console.log(`Removed duplicate function`);
  }
  
  return result;
}

function addMissingKeyProps(code: string): string {
  // Enhanced key prop detection for map functions
  return code.replace(
    /(\w+)\.map\s*\(\s*(\w+)\s*=>\s*\(\s*<(\w+)([^>]*?)>/g,
    (match, array, item, tag, attributes) => {
      if (attributes.includes('key=')) return match;
      // Use item.id if available, otherwise use item.name or fallback
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
