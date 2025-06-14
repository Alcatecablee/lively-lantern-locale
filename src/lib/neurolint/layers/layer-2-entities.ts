
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Fix HTML entity corruption - this is the main purpose of this layer
  transformed = fixHTMLEntities(transformed);
  transformed = addUseClientDirective(transformed);
  
  return transformed;
}

function fixHTMLEntities(code: string): string {
  let fixed = code;
  
  // Fix common HTML entities
  fixed = fixed.replace(/&quot;/g, '"');
  fixed = fixed.replace(/&#x27;/g, "'");
  fixed = fixed.replace(/&amp;/g, '&');
  fixed = fixed.replace(/&lt;/g, '<');
  fixed = fixed.replace(/&gt;/g, '>');
  
  return fixed;
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
