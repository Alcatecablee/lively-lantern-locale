
export function fixMissingKeyProps(code: string): string {
  // Only fix simple, safe map patterns to avoid corrupting complex expressions, especially for interactive elements

  // Pattern 1: Simple map with arrow function returning JSX element (most common)
  let fixed = code.replace(
    /\.map\(\s*\(([^,)]+)(?:\s*,\s*([^)]+))?\)\s*=>\s*<(\w+)([^>]*?)(?:\s*\/>|>[^<]*<\/\3>)/g,
    (match, item, index, component, props) => {
      // Patch: Don't touch if any dangerous patterns are present
      // 1. Never touch <button ...>, <input ...>, <a ...> etc
      // 2. Never touch if match or props look like they might have an onClick, arrow function, or similar
      if (
        props.includes('key=') ||
        match.includes('onClick=') ||
        props.includes('onClick=') ||
        match.includes('=>') ||
        ['button', 'input', 'a', 'textarea', 'form', 'select'].includes(component)
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
      if (
        props.includes('key=') ||
        match.includes('onClick=') ||
        props.includes('onClick=') ||
        match.includes('=>') ||
        ['button', 'input', 'a', 'textarea', 'form', 'select'].includes(component)
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
