
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply component-specific fixes
  transformed = addMissingImports(transformed);
  transformed = convertVarToConst(transformed);
  transformed = addMissingKeyProps(transformed);
  transformed = addAccessibilityAttributes(transformed);
  transformed = addTypeScriptInterfaces(transformed);
  transformed = optimizeConsoleStatements(transformed);
  
  return transformed;
}

function addMissingImports(code: string): string {
  // Add React import if useState/useEffect are used but React isn't imported
  if ((code.includes('useState') || code.includes('useEffect')) && !code.includes('import React')) {
    if (!code.includes('import {') || !code.includes('react')) {
      return `import React, { useState, useEffect } from 'react';\n\n${code}`;
    }
  }
  return code;
}

function convertVarToConst(code: string): string {
  // Convert var declarations to const - more robust pattern
  return code.replace(/\bvar\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g, 'const $1 =');
}

function addMissingKeyProps(code: string): string {
  // Add key props to map operations that don't have them - improved regex
  let fixed = code;
  
  // Match .map(item => (<div>...)) patterns without existing key
  fixed = fixed.replace(
    /\.map\(\s*(\w+)\s*=>\s*\(\s*<(\w+)([^>]*?)>/g,
    (match, itemVar, tagName, attributes) => {
      if (!attributes.includes('key=')) {
        const keyAttr = ` key={${itemVar}.id || ${itemVar}.name || Math.random()}`;
        return `.map(${itemVar} => (<${tagName}${attributes}${keyAttr}>`;
      }
      return match;
    }
  );
  
  // Also handle without parentheses: .map(item => <div>...)
  fixed = fixed.replace(
    /\.map\(\s*(\w+)\s*=>\s*<(\w+)([^>]*?)>/g,
    (match, itemVar, tagName, attributes) => {
      if (!attributes.includes('key=')) {
        const keyAttr = ` key={${itemVar}.id || ${itemVar}.name || Math.random()}`;
        return `.map(${itemVar} => <${tagName}${attributes}${keyAttr}>`;
      }
      return match;
    }
  );
  
  return fixed;
}

function addAccessibilityAttributes(code: string): string {
  let fixed = code;
  
  // Add alt attributes to images that don't have them
  fixed = fixed.replace(/<img\s+([^>]*?)src=\{([^}]+)\}([^>]*?)(?![^<]*alt=)/g, 
    '<img $1src={$2}$3 alt=""');
  
  // Add aria-label to buttons without text content
  fixed = fixed.replace(/<button([^>]*?)>(\s*)([^<]*?)<\/button>/g, 
    (match, attrs, whitespace, content) => {
      // If button has no meaningful content and no aria-label
      if (!attrs.includes('aria-label') && (!content || content.trim() === '')) {
        return `<button${attrs} aria-label="Button">${whitespace}${content}</button>`;
      }
      return match;
    });
  
  return fixed;
}

function addTypeScriptInterfaces(code: string): string {
  // Add basic interface for props if component has props parameter
  if (code.includes('function ') && code.includes('({ ') && !code.includes('interface ')) {
    // Extract component name and create interface
    const functionMatch = code.match(/function\s+(\w+)\s*\(\s*\{\s*([^}]+)\s*\}/);
    if (functionMatch) {
      const componentName = functionMatch[1];
      const interfaceName = `${componentName}Props`;
      
      const interfaceDeclaration = `interface ${interfaceName} {
  user?: any;
  [key: string]: any;
}

`;
      return interfaceDeclaration + code.replace(/\{\s*(\w+)\s*\}/g, `{ $1 }: ${interfaceName}`);
    }
  }
  return code;
}

function optimizeConsoleStatements(code: string): string {
  // Convert console.log to console.debug
  return code.replace(/console\.log\(/g, 'console.debug(');
}
