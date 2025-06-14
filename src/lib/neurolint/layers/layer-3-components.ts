
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
  // Convert var declarations to const
  return code.replace(/\bvar\s+(\w+)\s*=/g, 'const $1 =');
}

function addMissingKeyProps(code: string): string {
  // Add key props to map operations that don't have them
  return code.replace(
    /\.map\(\s*(\w+)\s*=>\s*\(\s*<(\w+)([^>]*?)>\s*\{[^}]*\}\s*<\/\2>\s*\)\s*\)/g,
    (match, itemVar, tagName, attributes) => {
      if (!attributes.includes('key=')) {
        const keyAttr = ` key={${itemVar}.id || ${itemVar}.name || Math.random()}`;
        return match.replace(`<${tagName}${attributes}>`, `<${tagName}${attributes}${keyAttr}>`);
      }
      return match;
    }
  );
}

function addAccessibilityAttributes(code: string): string {
  let fixed = code;
  
  // Add alt attributes to images
  fixed = fixed.replace(/<img\s+([^>]*?)src={([^}]+)}([^>]*?)(?!.*alt=)/g, 
    '<img $1src={$2}$3 alt=""');
  
  // Add aria-label to buttons without text content
  fixed = fixed.replace(/<button([^>]*?)>(\s*)<\/button>/g, 
    '<button$1 aria-label="Button">$2</button>');
  
  return fixed;
}

function addTypeScriptInterfaces(code: string): string {
  // Add basic interface for props if component has props parameter
  if (code.includes('function ') && code.includes('({ ') && !code.includes('interface ')) {
    const interfaceDeclaration = `interface Props {
  user?: any;
  [key: string]: any;
}

`;
    return interfaceDeclaration + code.replace(/\{\s*(\w+)\s*\}/g, '{ $1 }: Props');
  }
  return code;
}

function optimizeConsoleStatements(code: string): string {
  // Convert console.log to console.debug
  return code.replace(/console\.log\(/g, 'console.debug(');
}
