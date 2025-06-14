
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  console.log('Layer 2 (Entities) input length:', code.length);
  console.log('Layer 2 (Entities) input sample:', code.substring(0, 200));
  
  // Fix HTML entity corruption - this is the main purpose of this layer
  transformed = fixHTMLEntities(transformed);
  
  console.log('Layer 2 (Entities) output length:', transformed.length);
  console.log('Layer 2 changes:', transformed !== code);
  console.log('Layer 2 (Entities) output sample:', transformed.substring(0, 200));
  
  return transformed;
}

function fixHTMLEntities(code: string): string {
  let fixed = code;
  
  // Fix common HTML entities with more comprehensive patterns
  const originalLength = fixed.length;
  
  fixed = fixed.replace(/&quot;/g, '"');
  fixed = fixed.replace(/&#x27;/g, "'");
  fixed = fixed.replace(/&#39;/g, "'");
  fixed = fixed.replace(/&amp;/g, '&');
  fixed = fixed.replace(/&lt;/g, '<');
  fixed = fixed.replace(/&gt;/g, '>');
  fixed = fixed.replace(/&nbsp;/g, ' ');
  
  // Additional entity fixes
  fixed = fixed.replace(/&apos;/g, "'");
  fixed = fixed.replace(/&lsquo;/g, "'");
  fixed = fixed.replace(/&rsquo;/g, "'");
  fixed = fixed.replace(/&ldquo;/g, '"');
  fixed = fixed.replace(/&rdquo;/g, '"');
  
  console.log('HTML entities fix: before length', originalLength, 'after length', fixed.length);
  
  return fixed;
}
