
export function fixMissingKeyProps(code: string): string {
  // Only fix simple, safe map patterns to avoid corrupting complex expressions
  // This is now mainly a fallback - AST should handle most cases

  // Pattern 1: Simple map with arrow function returning JSX element (most common)
  // Patch: Never touch if props contains "onClick=" or "=>" in the whole match
  let fixed = code.replace(
    /\.map\(\s*\(([^,)]+)(?:\s*,\s*([^)]+))?\)\s*=>\s*<(\w+)([^>]*?)(?:\s*\/>|>[^<]*<\/\3>)/g,
    (match, item, index, component, props) => {
      // Patch: Don't modify if match or props look like they might have an onClick or an arrow function
      if (
        props.includes('key=') ||
        match.includes('onClick=') ||
        match.includes('=>') // Defensive for arrow function inside attribute value
      ) {
        return match;
      }

      const keyValue = index ? `{${index}}` : `{${item}.id || Math.random()}`;

      if (match.includes('/>')) {
        return match.replace(
          `<${component}${props}`,
          `<${component} key=${keyValue}${props}`
        );
      } else {
        return match.replace(
          `<${component}${props}>`,
          `<${component} key=${keyValue}${props}>`
        );
      }
    }
  );

  // Pattern 2: Map with parentheses around JSX
  fixed = fixed.replace(
    /\.map\(\s*\(([^,)]+)(?:\s*,\s*([^)]+))?\)\s*=>\s*\(\s*<(\w+)([^>]*?)(?:\s*\/>)/g,
    (match, item, index, component, props) => {
      // Patch: Don't modify if props or match contain onClick or arrow functions
      if (
        props.includes('key=') ||
        match.includes('onClick=') ||
        match.includes('=>')
      ) {
        return match;
      }

      const keyValue = index ? `{${index}}` : `{${item}.id || Math.random()}`;
      return match.replace(
        `<${component}${props}`,
        `<${component} key=${keyValue}${props}`
      );
    }
  );

  return fixed;
}
