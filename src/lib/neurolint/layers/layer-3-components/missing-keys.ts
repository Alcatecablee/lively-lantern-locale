export function fixMissingKeyProps(code: string): string {
  // Only fix simple map patterns to avoid corrupting complex expressions

  // Pattern 1: Simple map with arrow function returning JSX element
  let fixed = code.replace(
    /\.map\(\s*\(([^,)]+)(?:\s*,\s*([^)]+))?\)\s*=>\s*<(\w+)([^>]*)>(.*?)<\/\3>/gs,
    (match, item, index, component, props, children) => {
      if (
        props.includes("key=") ||
        match.includes("onClick=") ||
        props.includes("onClick=") ||
        ["button", "input", "a", "textarea", "form", "select"].includes(
          component,
        )
      ) {
        return match;
      }
      const keyValue = index ? `{${index}}` : `{${item}.id || Math.random()}`;
      return `<${component} key=${keyValue}${props}>${children}</${component}>`;
    },
  );

  // Pattern 2: items.map(item => <li>{item.name}</li>) - Fixed to handle without trailing parenthesis
  fixed = fixed.replace(
    /\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*\(\s*<(\w+)([^>]*)>([\s\S]*?)<\/\2>\s*\)\s*\)/g,
    (match, item, component, props, children) => {
      if (
        props.includes("key=") ||
        match.includes("onClick=") ||
        props.includes("onClick=") ||
        ["button", "input", "a", "textarea", "form", "select"].includes(
          component,
        )
      ) {
        return match;
      }
      const keyValue = `{${item}.id || Math.random()}`;
      return `.map(${item} => (<${component} key=${keyValue}${props}>${children}</${component}>))`;
    },
  );

  // Pattern 2b: Basic form without extra parentheses
  fixed = fixed.replace(
    /\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*<(\w+)([^>]*)>([\s\S]*?)<\/\2>\s*\)/g,
    (match, item, component, props, children) => {
      if (
        props.includes("key=") ||
        match.includes("onClick=") ||
        props.includes("onClick=") ||
        ["button", "input", "a", "textarea", "form", "select"].includes(
          component,
        )
      ) {
        return match;
      }
      const keyValue = `{${item}.id || Math.random()}`;
      return `.map(${item} => <${component} key=${keyValue}${props}>${children}</${component}>)`;
    },
  );

  // Pattern 3: concise arrow function with no parentheses in .map single expression
  fixed = fixed.replace(
    /\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*<(\w+)([^>]*)>(.*?)<\/\2>/gs,
    (match, item, component, props, children) => {
      if (
        props.includes("key=") ||
        match.includes("onClick=") ||
        props.includes("onClick=") ||
        ["button", "input", "a", "textarea", "form", "select"].includes(
          component,
        )
      ) {
        return match;
      }
      const keyValue = `{${item}.id || Math.random()}`;
      return `<${component} key=${keyValue}${props}>${children}</${component}>`;
    },
  );

  // Pattern 4: self-closing tags in .map
  fixed = fixed.replace(
    /\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*<(\w+)([^>]*)\/>/g,
    (match, item, component, props) => {
      if (
        props.includes("key=") ||
        match.includes("onClick=") ||
        props.includes("onClick=") ||
        ["button", "input", "a", "textarea", "form", "select"].includes(
          component,
        )
      ) {
        return match;
      }
      const keyValue = `{${item}.id || Math.random()}`;
      return `<${component} key=${keyValue}${props}/>`;
    },
  );

  // Pattern 5: map with parentheses arrow function returning JSX in parens
  fixed = fixed.replace(
    /\.map\(\s*\(([^,)]+)(?:\s*,\s*([^)]+))?\)\s*=>\s*\(\s*<(\w+)([^>]*)>(.*?)<\/\3>\s*\)/gs,
    (match, item, index, component, props, children) => {
      if (
        props.includes("key=") ||
        match.includes("onClick=") ||
        props.includes("onClick=") ||
        ["button", "input", "a", "textarea", "form", "select"].includes(
          component,
        )
      ) {
        return match;
      }
      const keyValue = index ? `{${index}}` : `{${item}.id || Math.random()}`;
      return `<${component} key=${keyValue}${props}>${children}</${component}>`;
    },
  );

  // Additional catch-all: specifically for concise .map(item => <li>{...}</li>)
  // This runs *after* all the above, so only missed cases apply.
  // Matches .map(item => <li ...>...</li>)
  fixed = fixed.replace(
    /\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*<li([^>]*)>([\s\S]*?)<\/li>\s*\)/g,
    (match, item, props, children) => {
      if (props.includes("key=")) return match;
      return `.map(${item} => <li key={${item}.id || Math.random()}${props}>${children}</li>)`;
    },
  );

  // Handle case with parentheses around JSX: .map(item => (<li>...</li>)) - be very careful
  try {
    fixed = fixed.replace(
      /\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*\(\s*<(\w+)([^>]*)>([\s\S]*?)<\/\2>\s*\)\s*\)/g,
      (match, item, component, props, children) => {
        // Don't modify if already has key or if syntax looks complex
        if (
          props.includes("key=") ||
          match.includes("onClick=") ||
          children.includes("{")
        ) {
          return match;
        }
        return `.map(${item} => (<${component} key={${item}.id || Math.random()}${props}>${children}</${component}>))`;
      },
    );
  } catch (e) {
    // If regex fails, return original to prevent corruption
    return code;
  }

  return fixed;
}
