
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
  
  // Add aria-label to buttons without accessible text - preserve existing attributes
  fixed = fixed.replace(
    /<button([^>]*?)>/g,
    (match, attributes) => {
      if (!attributes.includes('aria-label') && !attributes.includes('aria-labelledby')) {
        // Insert aria-label at the end of attributes, before the closing >
        return `<button${attributes} aria-label="Button">`;
      }
      return match;
    }
  );
  
  return fixed;
}
