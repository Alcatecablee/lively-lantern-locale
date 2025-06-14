
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  console.log('Layer 3 (Components) input length:', code.length);
  
  // Apply component-specific fixes in order
  transformed = convertVarToConst(transformed);
  transformed = addMissingKeyProps(transformed);
  transformed = addAccessibilityAttributes(transformed);
  transformed = optimizeConsoleStatements(transformed);
  transformed = addMissingImports(transformed);
  transformed = addTypeScriptInterfaces(transformed);
  
  console.log('Layer 3 (Components) output length:', transformed.length);
  console.log('Layer 3 changes:', transformed !== code);
  
  return transformed;
}

function convertVarToConst(code: string): string {
  // Convert var declarations to const/let
  let fixed = code.replace(/\bvar\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g, 'const $1 =');
  return fixed;
}

function addMissingKeyProps(code: string): string {
  let fixed = code;
  
  // Add key props to map operations - improved pattern matching
  // Pattern: .map(item => (<div>...)) or .map(item => <div>...)
  fixed = fixed.replace(
    /\.map\(\s*(\w+)\s*=>\s*\(\s*<(\w+)([^>]*?)>/g,
    (match, itemVar, tagName, attributes) => {
      if (!attributes.includes('key=')) {
        const keyAttr = ` key={${itemVar}.id || ${itemVar}.name || Math.random()}`;
        return `.map(${itemVar} => (<${tagName}${keyAttr}${attributes}>`;
      }
      return match;
    }
  );
  
  // Pattern without parentheses: .map(item => <div>...)
  fixed = fixed.replace(
    /\.map\(\s*(\w+)\s*=>\s*<(\w+)([^>]*?)>/g,
    (match, itemVar, tagName, attributes) => {
      if (!attributes.includes('key=')) {
        const keyAttr = ` key={${itemVar}.id || ${itemVar}.name || Math.random()}`;
        return `.map(${itemVar} => <${tagName}${keyAttr}${attributes}>`;
      }
      return match;
    }
  );
  
  return fixed;
}

function addAccessibilityAttributes(code: string): string {
  let fixed = code;
  
  // Add alt attributes to images that don't have them
  fixed = fixed.replace(
    /<img\s+([^>]*?)src=\{([^}]+)\}([^>]*?)(?![^<]*alt=)/g, 
    '<img $1src={$2}$3 alt=""'
  );
  
  // Add aria-label to buttons without text content or existing aria attributes
  fixed = fixed.replace(
    /<button([^>]*?)>(\s*)([^<]*?)<\/button>/g, 
    (match, attrs, whitespace, content) => {
      // If button has no meaningful content and no aria-label
      if (!attrs.includes('aria-label') && (!content || content.trim() === '')) {
        return `<button${attrs} aria-label="Button">${whitespace}${content}</button>`;
      }
      return match;
    }
  );
  
  return fixed;
}

function optimizeConsoleStatements(code: string): string {
  // Convert console.log to console.debug for better production practices
  return code.replace(/console\.log\(/g, 'console.debug(');
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
