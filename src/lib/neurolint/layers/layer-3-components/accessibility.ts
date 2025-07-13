export function fixAccessibilityAttributes(code: string): string {
  let fixed = code;

  // Add alt attributes to images - don't modify if already has alt
  fixed = fixed.replace(/<img([^>]*?)(?:\s*\/?>)/g, (match, attributes) => {
    if (!attributes.includes("alt=")) {
      return `<img${attributes} alt="" />`;
    }
    return match;
  });

  // Add aria-label to buttons without existing aria attributes (be very careful with JSX)
  try {
    fixed = fixed.replace(
      /<button(\s[^>]*?)>([\s\S]*?)<\/button>/g,
      (match, attributes, content) => {
        // Don't modify if already has aria attributes or if it would break syntax
        if (
          attributes.includes("aria-") ||
          (match.includes("{") && !match.includes("}"))
        ) {
          return match;
        }

        // Extract simple text content only
        const textContent = content
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (textContent && textContent.length > 0 && textContent.length < 50) {
          // Only add if it's simple text content
          return `<button${attributes} aria-label="${textContent}">${content}</button>`;
        }

        return match; // Don't modify complex buttons
      },
    );
  } catch (e) {
    // If regex fails, return original
    return code;
  }

  // Add role and aria-label to interactive elements
  fixed = fixed.replace(/<div([^>]*?)onClick/g, (match, attributes) => {
    if (!attributes.includes("role=") && !attributes.includes("aria-")) {
      return `<div${attributes} role="button" aria-label="Interactive element" onClick`;
    }
    return match;
  });

  return fixed;
}
