
export function fixMissingKeyProps(code: string): string {
  // Fix map operations without keys - more robust pattern
  return code.replace(
    /\.map\(\s*\(?\s*(\w+)(?:\s*,\s*(\w+))?\s*\)?\s*=>\s*\(\s*<(\w+)([^>]*?)(?:>[\s\S]*?<\/\3>|\/?>)/g,
    (match, item, index, component, props) => {
      if (props.includes('key=')) return match;
      
      const keyValue = index ? `{${index}}` : `{${item}.id || ${item}.name || Math.random()}`;
      const hasClosingTag = match.includes(`</${component}>`);
      
      if (hasClosingTag) {
        return match.replace(
          `<${component}${props}>`,
          `<${component} key=${keyValue}${props}>`
        );
      } else {
        return match.replace(
          `<${component}${props}`,
          `<${component} key=${keyValue}${props}`
        );
      }
    }
  );
}
