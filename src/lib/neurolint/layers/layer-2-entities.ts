
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Fix HTML entity corruption - this is the main purpose of this layer
  transformed = fixHTMLEntities(transformed);
  
  return transformed;
}

function fixHTMLEntities(code: string): string {
  let fixed = code;
  
  // Fix common HTML entities
  fixed = fixed.replace(/&quot;/g, '"');
  fixed = fixed.replace(/&#x27;/g, "'");
  fixed = fixed.replace(/&#39;/g, "'");
  fixed = fixed.replace(/&amp;/g, '&');
  fixed = fixed.replace(/&lt;/g, '<');
  fixed = fixed.replace(/&gt;/g, '>');
  fixed = fixed.replace(/&nbsp;/g, ' ');
  
  return fixed;
}
