

export function fixAccessibilityAttributes(code: string): string {
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
  
  // Add aria-label to buttons without accessible text
  // Use a more sophisticated approach that doesn't break complex attributes
  fixed = fixed.replace(
    /<button([^>]*?)>(.*?)<\/button>/gs,
    (match, attributes, content) => {
      // Check if aria-label or aria-labelledby already exists
      if (!attributes.includes('aria-label') && !attributes.includes('aria-labelledby')) {
        // Check if the button has text content (not just whitespace/variables)
        const hasTextContent = content.trim() && 
          !content.trim().startsWith('{') && 
          content.replace(/\s+/g, ' ').trim() !== '';
        
        // Only add aria-label if there's no meaningful text content
        if (!hasTextContent) {
          // Safely add aria-label as a separate attribute
          const cleanAttributes = attributes.trim();
          if (cleanAttributes === '') {
            return `<button aria-label="Button">${content}</button>`;
          } else {
            return `<button${cleanAttributes} aria-label="Button">${content}</button>`;
          }
        }
      }
      return match;
    }
  );
  
  return fixed;
}

