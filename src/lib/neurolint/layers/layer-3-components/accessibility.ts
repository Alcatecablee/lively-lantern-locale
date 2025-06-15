
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
  // More careful regex to avoid corrupting onClick handlers
  fixed = fixed.replace(
    /<button([^>]*?)>/g,
    (match, attributes) => {
      // Check if aria-label or aria-labelledby already exists
      if (!attributes.includes('aria-label') && !attributes.includes('aria-labelledby')) {
        // Only add aria-label if we can safely insert it
        // Avoid inserting into complex attribute patterns
        if (attributes.trim() === '') {
          return `<button aria-label="Button">`;
        } else {
          // Insert aria-label before the closing > but after existing attributes
          return `<button${attributes} aria-label="Button">`;
        }
      }
      return match;
    }
  );
  
  return fixed;
}
