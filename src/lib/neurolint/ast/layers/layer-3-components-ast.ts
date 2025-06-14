
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
  
  // Remove duplicate functions - much simpler approach
  transformed = removeDuplicateFunctions(transformed);
  
  // Add missing key props - simpler regex
  transformed = addMissingKeyProps(transformed);
  
  // Convert var to const
  transformed = transformed.replace(/\bvar\s+/g, 'const ');
  
  // Add basic accessibility - much simpler approach
  // Fix img tags without alt
  transformed = transformed.replace(/<img\s+([^>]*?)>/g, (match, attrs) => {
    if (attrs.includes('alt=')) return match;
    return `<img ${attrs} alt="" />`;
  });
  
  // Fix button accessibility
  transformed = transformed.replace(/<button\s+([^>]*?)>/g, (match, attrs) => {
    if (attrs.includes('aria-label')) return match;
    return `<button aria-label="Button" ${attrs}>`;
  });
  
  // Add TypeScript interfaces for components with props - simpler approach
  if (transformed.includes('function') && transformed.includes('({ ') && !transformed.includes('interface')) {
    transformed = addBasicInterface(transformed);
  }
  
  console.log('Component transformations completed');
  return transformed;
}

function removeDuplicateFunctions(code: string): string {
  // Much simpler approach - just find and remove exact duplicate function blocks
  const lines = code.split('\n');
  const seenFunctions = new Set();
  const result = [];
  let currentFunction = '';
  let inFunction = false;
  let functionName = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line starts a function
    const functionMatch = line.match(/^\s*function\s+(\w+)\s*\(/);
    if (functionMatch) {
      functionName = functionMatch[1];
      inFunction = true;
      currentFunction = line;
      continue;
    }
    
    if (inFunction) {
      currentFunction += '\n' + line;
      
      // Check if function ends (simple brace counting)
      if (line.includes('}') && !line.includes('{')) {
        // Function ended
        if (seenFunctions.has(functionName)) {
          // Skip this duplicate function
          console.log(`Removed duplicate function: ${functionName}`);
        } else {
          // Add this function
          result.push(currentFunction);
          seenFunctions.add(functionName);
        }
        inFunction = false;
        currentFunction = '';
        continue;
      }
    }
    
    if (!inFunction) {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

function addMissingKeyProps(code: string): string {
  // Much simpler regex that actually works
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
  // Much simpler interface addition
  const componentMatch = code.match(/function\s+(\w+)\s*\(\s*{\s*([^}]+)\s*}\s*\)/);
  if (componentMatch) {
    const componentName = componentMatch[1];
    const props = componentMatch[2];
    const interfaceName = `${componentName}Props`;
    
    const interfaceCode = `interface ${interfaceName} {
  ${props.split(',').map(prop => `${prop.trim()}: any;`).join('\n  ')}
}

`;
    
    // Replace the function signature
    return interfaceCode + code.replace(
      `function ${componentName}({ ${props} })`,
      `function ${componentName}({ ${props} }: ${interfaceName})`
    );
  }
  
  return code;
}
