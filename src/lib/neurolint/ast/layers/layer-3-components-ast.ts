export async function transformAST(code: string): Promise<string> {
  console.log('Using ultra-simplified component transformations for MVP');
  
  let transformed = code;
  
  // 1. Add missing imports (simple approach)
  if ((code.includes('useState') || code.includes('useEffect')) && !code.includes('import {')) {
    const imports = [];
    if (code.includes('useState')) imports.push('useState');
    if (code.includes('useEffect')) imports.push('useEffect');
    transformed = `import { ${imports.join(', ')} } from 'react';\n${transformed}`;
  }
  
  // 2. Convert var to const (simplest approach)
  transformed = transformed.replace(/\bvar\s+/g, 'const ');
  
  // 3. Add missing key props (ultra-simple regex)
  transformed = transformed.replace(
    /(\w+)\.map\s*\(\s*(\w+)\s*=>\s*\(\s*<(\w+)([^>]*?)>/g,
    (match, array, item, tag, attributes) => {
      if (attributes.includes('key=')) return match;
      return match.replace(`<${tag}${attributes}>`, `<${tag} key={${item}.id || ${item}.name || Math.random()}${attributes}>`);
    }
  );
  
  // 4. Fix img tags - completely rewritten approach
  transformed = transformed.replace(/<img\s+([^>]*?)\s*\/?>/g, (match, attrs) => {
    // Clean up any malformed syntax first
    let cleanAttrs = attrs.replace(/\s*\/\s*/, ' ').trim();
    
    // Add alt attribute if missing
    if (!cleanAttrs.includes('alt=')) {
      cleanAttrs += ' alt=""';
    }
    
    return `<img ${cleanAttrs} />`;
  });
  
  // 5. Fix button accessibility
  transformed = transformed.replace(/<button\s+([^>]*?)>/g, (match, attrs) => {
    if (attrs.includes('aria-label')) return match;
    return `<button aria-label="Button" ${attrs}>`;
  });
  
  // 6. Remove duplicate functions - completely new approach using function signatures
  transformed = removeDuplicateFunctionsNew(transformed);
  
  // 7. Add TypeScript interfaces - simplified approach
  transformed = addSimpleInterfaceNew(transformed);
  
  console.log('Component transformations completed');
  return transformed;
}

function removeDuplicateFunctionsNew(code: string): string {
  // Split by lines and track function signatures
  const lines = code.split('\n');
  const seenFunctions = new Set();
  const resultLines = [];
  let inDuplicateFunction = false;
  let braceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check if this line starts a function
    const functionMatch = trimmedLine.match(/^\s*function\s+(\w+)\s*\(/);
    if (functionMatch) {
      const functionName = functionMatch[1];
      
      if (seenFunctions.has(functionName)) {
        // This is a duplicate, start skipping
        inDuplicateFunction = true;
        braceDepth = 0;
        // Count opening braces in this line
        braceDepth += (line.match(/{/g) || []).length;
        braceDepth -= (line.match(/}/g) || []).length;
        continue;
      } else {
        // First occurrence, keep it
        seenFunctions.add(functionName);
        inDuplicateFunction = false;
      }
    }
    
    if (inDuplicateFunction) {
      // Count braces to know when function ends
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;
      
      // If we're back to 0, the function has ended
      if (braceDepth <= 0) {
        inDuplicateFunction = false;
      }
      continue;
    }
    
    resultLines.push(line);
  }
  
  return resultLines.join('\n');
}

function addSimpleInterfaceNew(code: string): string {
  // Only add interface if function has destructured props
  const match = code.match(/function\s+(\w+)\s*\(\s*{\s*([^}]+)\s*}\s*\)/);
  if (match) {
    const componentName = match[1];
    const props = match[2].trim();
    const interfaceName = `${componentName}Props`;
    
    // Create simple interface
    const interfaceCode = `interface ${interfaceName} {\n  ${props}: any;\n}\n\n`;
    
    // Replace function signature
    const newSignature = `function ${componentName}({ ${props} }: ${interfaceName})`;
    
    return interfaceCode + code.replace(match[0], newSignature);
  }
  
  return code;
}
