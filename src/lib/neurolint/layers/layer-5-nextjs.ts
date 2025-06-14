
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  console.log('Layer 5 (Next.js) input length:', code.length);
  console.log('Layer 5 (Next.js) checking for use client...');
  
  // Add 'use client' directive for client-side React components
  transformed = addUseClientDirective(transformed);
  
  // Clean up any import corruption
  transformed = cleanImports(transformed);
  
  console.log('Layer 5 (Next.js) output length:', transformed.length);
  console.log('Layer 5 changes:', transformed !== code);
  
  return transformed;
}

function addUseClientDirective(code: string): string {
  // Check if this looks like a React component that needs 'use client'
  const hasReactFeatures = /useState|useEffect|onClick|onChange|onSubmit/.test(code);
  const hasUseClient = code.includes("'use client'") || code.includes('"use client"');
  
  console.log('Has React features:', hasReactFeatures);
  console.log('Has use client:', hasUseClient);
  
  if (hasReactFeatures && !hasUseClient) {
    console.log('Adding use client directive');
    return "'use client';\n\n" + code;
  }
  
  return code;
}

function cleanImports(code: string): string {
  let fixed = code;
  
  // Remove duplicate imports
  const importLines = fixed.split('\n').filter(line => line.trim().startsWith('import'));
  const uniqueImports = [...new Set(importLines)];
  
  // Replace all import lines with unique ones
  if (importLines.length !== uniqueImports.length) {
    const nonImportLines = fixed.split('\n').filter(line => !line.trim().startsWith('import'));
    fixed = uniqueImports.join('\n') + '\n' + nonImportLines.join('\n');
  }
  
  return fixed;
}
