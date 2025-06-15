
export function fixMissingKeyProps(code: string): string {
  // Only fix simple map patterns to avoid corrupting complex expressions

  // Pattern 1: Simple map with arrow function returning JSX element
  let fixed = code.replace(
    /\.map\(\s*\(([^,)]+)(?:\s*,\s*([^)]+))?\)\s*=>\s*<(\w+)([^>]*)>(.*?)<\/\3>/gs,
    (match, item, index, component, props, children) => {
      // Skip if already has key or is dangerous
      if (
        props.includes('key=') ||
        match.includes('onClick=') ||
        props.includes('onClick=') ||
        ['button', 'input', 'a', 'textarea', 'form', 'select'].includes(component)
      ) {
        return match;
      }
      const keyValue = index
        ? `{${index}}`
        : `{${item}.id || Math.random()}`;
      return `<${component} key=${keyValue}${props}>${children}</${component}>`;
    }
  );

  // Pattern 2: concise arrow function, e.g. items.map(item => <li>{item.name}</li>)
  // Also supports: items.map(item => <li {...spread}>{item.name}</li>)
  fixed = fixed.replace(
    /\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*<(\w+)([^>]*)>(.*?)<\/\2>/gs,
    (match, item, component, props, children) => {
      // Prevent duplicate key or risky changes
      if (
        props.includes('key=') ||
        match.includes('onClick=') ||
        props.includes('onClick=') ||
        ['button', 'input', 'a', 'textarea', 'form', 'select'].includes(component)
      ) {
        return match;
      }
      const keyValue = `{${item}.id || Math.random()}`;
      return `<${component} key=${keyValue}${props}>${children}</${component}>`;
    }
  );

  // Pattern 3: self-closing tags (rare for lists, but add for safety/completeness)
  fixed = fixed.replace(
    /\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*<(\w+)([^>]*)\/>/g,
    (match, item, component, props) => {
      if (
        props.includes('key=') ||
        match.includes('onClick=') ||
        props.includes('onClick=') ||
        ['button', 'input', 'a', 'textarea', 'form', 'select'].includes(component)
      ) {
        return match;
      }
      const keyValue = `{${item}.id || Math.random()}`;
      return `<${component} key=${keyValue}${props}/>`;
    }
  );

  // Pattern 4: map with parentheses around arrow and JSX
  fixed = fixed.replace(
    /\.map\(\s*\(([^,)]+)(?:\s*,\s*([^)]+))?\)\s*=>\s*\(\s*<(\w+)([^>]*)>(.*?)<\/\3>\s*\)/gs,
    (match, item, index, component, props, children) => {
      if (
        props.includes('key=') ||
        match.includes('onClick=') ||
        props.includes('onClick=') ||
        ['button', 'input', 'a', 'textarea', 'form', 'select'].includes(component)
      ) {
        return match;
      }
      const keyValue = index
        ? `{${index}}`
        : `{${item}.id || Math.random()}`;
      return `<${component} key=${keyValue}${props}>${children}</${component}>`;
    }
  );

  return fixed;
}
