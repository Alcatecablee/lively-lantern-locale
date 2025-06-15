
export function fixMissingKeyProps(code: string): string {
  // Only fix simple, safe map patterns to avoid corrupting complex expressions
  // This is now mainly a fallback - AST should handle most cases
  
  // Pattern 1: Simple map with arrow function returning JSX element (most common)
  let fixed = code.replace(
    /\.map\(\s*\(([^,)]+)(?:\s*,\s*([^)]+))?\)\s*=>\s*<(\w+)([^>]*?)(?:\s*\/>|>[^<]*<\/\3>)/g,
    (match, item, index, component, props) => {
      // Skip if key already exists
      if (props.includes('key=')) return match;
      
      // Only apply to simple cases - avoid complex expressions
      if (props.includes('onClick=') && props.includes('=>')) {
        return match; // Skip complex onClick handlers
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
      // Skip if key already exists or has complex expressions
      if (props.includes('key=') || (props.includes('onClick=') && props.includes('=>'))) {
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
