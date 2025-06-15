
export function fixAccessibilityAttributes(code: string): string {
  // This function is now handled by AST-based transformation
  // when AST is available. This serves as a fallback for when
  // AST parsing fails.
  let fixed = code;
  
  // Add alt attributes to images - don't modify if already has alt
  fixed = fixed.replace(
    /<img([^>]*?)(?:\s*\/?>)/g,
    (match, attributes) => {
      if (!attributes.includes('alt=')) {
        return `<img${attributes} alt="" />`;
      }
      return match;
    }
  );
  
  // Note: Button aria-label handling is now done via AST to avoid
  // breaking complex onClick handlers and other attributes
  
  return fixed;
}
