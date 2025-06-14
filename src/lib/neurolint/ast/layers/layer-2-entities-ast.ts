
export async function transformAST(code: string): Promise<string> {
  console.log('Using simplified entity transformations for MVP');
  
  let fixed = code;
  
  // Fix HTML entities with simple string replacement
  fixed = fixed.replace(/&quot;/g, '"');
  fixed = fixed.replace(/&#x27;/g, "'");
  fixed = fixed.replace(/&#39;/g, "'");
  fixed = fixed.replace(/&amp;/g, '&');
  fixed = fixed.replace(/&lt;/g, '<');
  fixed = fixed.replace(/&gt;/g, '>');
  fixed = fixed.replace(/&nbsp;/g, ' ');
  fixed = fixed.replace(/&apos;/g, "'");
  
  console.log('Entity transformations completed');
  return fixed;
}
