export function fixAccessibilityAttributes(code: string): string {
  let fixed = code;

  // Add alt attributes to images - don't modify if already has alt
  fixed = fixed.replace(/<img([^>]*?)(?:\s*\/?>)/g, (match, attributes) => {
    if (!attributes.includes("alt=")) {
      return `<img${attributes} alt="" />`;
    }
    return match;
  });

  // Add aria-label to buttons without existing aria attributes
  fixed = fixed.replace(
    /<button([^>]*?)>(.*?)<\/button>/g,
    (match, attributes, content) => {
      // Don't modify if already has aria attributes
      if (attributes.includes("aria-") || attributes.includes("aria=")) {
        return match;
      }

      // Extract text content for aria-label
      const textContent = content.replace(/<[^>]*>/g, "").trim();
      if (textContent) {
        return `<button${attributes} aria-label="${textContent}">${content}</button>`;
      }

      return `<button${attributes} aria-label="Button">${content}</button>`;
    },
  );

  // Add role and aria-label to interactive elements
  fixed = fixed.replace(/<div([^>]*?)onClick/g, (match, attributes) => {
    if (!attributes.includes("role=") && !attributes.includes("aria-")) {
      return `<div${attributes} role="button" aria-label="Interactive element" onClick`;
    }
    return match;
  });

  return fixed;
}
