
export async function transformAST(code: string): Promise<string> {
  console.log('Using simplified Next.js transformations for MVP');
  
  let transformed = code;
  
  // Add 'use client' if needed (simple check)
  const needsUseClient = /useState|useEffect|onClick|onChange|onSubmit/.test(code);
  const hasUseClient = code.includes("'use client'") || code.includes('"use client"');
  
  if (needsUseClient && !hasUseClient) {
    transformed = "'use client';\n\n" + transformed;
  }
  
  console.log('Next.js transformations completed');
  return transformed;
}
