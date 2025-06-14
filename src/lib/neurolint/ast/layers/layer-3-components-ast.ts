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
  
  // 3. Add missing key props - completely rewritten with simpler regex
  transformed = transformed.replace(
    /(\w+)\.map\s*\(\s*(\w+)\s*=>\s*\(\s*<(\w+)([^>]*?)>/g,
    (match, array, item, tag, attributes) => {
      if (attributes.includes('key=')) return match;
      return match.replace(`<${tag}${attributes}>`, `<${tag} key={${item}.id || ${item}.name || Math.random()}${attributes}>`);
    }
  );
  
  // 4. Fix img tags - completely new approach
  transformed = fixImgTags(transformed);
  
  // 5. Fix button accessibility
  transformed = transformed.replace(/<button([^>]*)>/g, (match, attrs) => {
    if (attrs.includes('aria-label')) return match;
    return `<button aria-label="Button"${attrs}>`;
  });
  
  // 6. Remove duplicate functions - brand new approach
  transformed = removeDuplicatesSimple(transformed);
  
  // 7. Add TypeScript interfaces - much simpler approach
  transformed = addInterfaceSimple(transformed);
  
  console.log('Component transformations completed');
  return transformed;
}

function fixImgTags(code: string): string {
  // Find all img tags and fix them one by one
  return code.replace(/<img\s+([^>]*?)\s*\/?>/g, (match, attrs) => {
    // Clean up attributes
    let cleanAttrs = attrs.trim();
    
    // Add alt if missing
    if (!cleanAttrs.includes('alt=')) {
      cleanAttrs += ' alt=""';
    }
    
    // Ensure proper self-closing syntax
    return `<img ${cleanAttrs} />`;
  });
}

function removeDuplicatesSimple(code: string): string {
  const lines = code.split('\n');
  const result = [];
  const seenFunctions = new Set();
  let skipMode = false;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for function declaration
    const funcMatch = line.match(/^\s*function\s+(\w+)\s*\(/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      
      if (seenFunctions.has(funcName)) {
        // This is a duplicate - start skipping
        skipMode = true;
        braceCount = 0;
        // Count braces in this line
        for (const char of line) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        if (braceCount <= 0) skipMode = false; // Single line function
        continue;
      } else {
        // First occurrence - keep it
        seenFunctions.add(funcName);
      }
    }
    
    if (skipMode) {
      // Count braces to know when function ends
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      if (braceCount <= 0) {
        skipMode = false;
      }
      continue;
    }
    
    result.push(line);
  }
  
  return result.join('\n');
}

function addInterfaceSimple(code: string): string {
  // Look for function with destructured props
  const match = code.match(/function\s+(\w+)\s*\(\s*{\s*([^}]+)\s*}\s*\)/);
  if (match) {
    const componentName = match[1];
    const props = match[2].trim();
    const interfaceName = `${componentName}Props`;
    
    // Create interface
    const interfaceCode = `interface ${interfaceName} {\n  ${props}: any;\n}\n\n`;
    
    // Replace function signature
    const newSignature = `function ${componentName}({ ${props} }: ${interfaceName})`;
    
    return interfaceCode + code.replace(match[0], newSignature);
  }
  
  return code;
}
