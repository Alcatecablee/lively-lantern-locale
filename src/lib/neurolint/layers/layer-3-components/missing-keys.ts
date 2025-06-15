export function fixMissingKeyProps(code: string): string {
  // Only fix simple map patterns to avoid corrupting complex expressions

  // Pattern 1: Simple map with arrow function returning JSX element
  let fixed = code.replace(
    /\.map\(\s*\(([^,)]+)(?:\s*,\s*([^)]+))?\)\s*=>\s*<(\w+)([^>]*)>(.*?)<\/\3>/gs,
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

  // Pattern 2: items.map(item => <li>{item.name}</li>)
  // Improved to allow for extra spacing and parentheses around the argument
  fixed = fixed.replace(
    /\.map\(\s*(?:\(?\s*([a-zA-Z0-9_]+)\s*\)?)\s*=>\s*<(\w+)([^>]*)>([\s\S]*?)<\/\2>\s*\)/g,
    (match, item, component, props, children) => {
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

  // Pattern 3: concise arrow function with no parentheses in .map single expression
  fixed = fixed.replace(
    /\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*<(\w+)([^>]*)>(.*?)<\/\2>/gs,
    (match, item, component, props, children) => {
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

  // Pattern 4: self-closing tags in .map
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

  // Pattern 5: map with parentheses arrow function returning JSX in parens
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
