
export async function transformAST(code: string): Promise<string> {
  console.log('Using ultra-simplified component transformations for MVP');
  
  let transformed = code;
  
  // Add missing imports (simple approach)
  if ((code.includes('useState') || code.includes('useEffect')) && !code.includes('import {')) {
    const imports = [];
    if (code.includes('useState')) imports.push('useState');
    if (code.includes('useEffect')) imports.push('useEffect');
    transformed = `import { ${imports.join(', ')} } from 'react';\n${transformed}`;
  }
  
  // Convert var to const (simplest approach)
  transformed = transformed.replace(/\bvar\s+/g, 'const ');
  
  // Add missing key props (ultra-simple regex)
  transformed = transformed.replace(
    /(\w+)\.map\s*\(\s*(\w+)\s*=>\s*\(\s*<(\w+)([^>]*?)>/g,
    (match, array, item, tag, attributes) => {
      if (attributes.includes('key=')) return match;
      return match.replace(`<${tag}${attributes}>`, `<${tag} key={${item}.id || ${item}.name || Math.random()}${attributes}>`);
    }
  );
  
  // Fix img tags - ultra-simple approach
  transformed = transformed.replace(/<img\s+([^>]*?)\s*\/?>/g, (match, attrs) => {
    if (attrs.includes('alt=')) return match;
    // Clean up any malformed syntax first
    const cleanAttrs = attrs.replace(/\s*\/\s*/, ' ').trim();
    return `<img ${cleanAttrs} alt="" />`;
  });
  
  // Fix button accessibility
  transformed = transformed.replace(/<button\s+([^>]*?)>/g, (match, attrs) => {
    if (attrs.includes('aria-label')) return match;
    return `<button aria-label="Button" ${attrs}>`;
  });
  
  // Remove duplicate functions - ultra-simple string replacement approach
  transformed = removeDuplicateFunctionsSimple(transformed);
  
  // Add TypeScript interfaces - ultra-simple approach
  transformed = addSimpleInterface(transformed);
  
  console.log('Component transformations completed');
  return transformed;
}

function removeDuplicateFunctionsSimple(code: string): string {
  // Find exact duplicate function blocks using string matching
  const lines = code.split('\n');
  const functionBlocks = [];
  let currentBlock = '';
  let inFunction = false;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('function ')) {
      if (inFunction && currentBlock) {
        functionBlocks.push(currentBlock.trim());
      }
      currentBlock = line;
      inFunction = true;
      braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
    } else if (inFunction) {
      currentBlock += '\n' + line;
      braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      
      if (braceCount === 0) {
        functionBlocks.push(currentBlock.trim());
        currentBlock = '';
        inFunction = false;
      }
    }
  }
  
  // Remove exact duplicates
  const seen = new Set();
  const toKeep = [];
  
  for (const block of functionBlocks) {
    if (!seen.has(block)) {
      seen.add(block);
      toKeep.push(block);
    } else {
      console.log('Removed duplicate function block');
    }
  }
  
  // Reconstruct code without function blocks, then add unique ones
  let result = code;
  for (const block of functionBlocks) {
    result = result.replace(block, '');
  }
  
  // Add back the unique functions
  for (const block of toKeep) {
    result += '\n' + block;
  }
  
  return result.replace(/\n\s*\n\s*\n/g, '\n\n'); // Clean up extra newlines
}

function addSimpleInterface(code: string): string {
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
