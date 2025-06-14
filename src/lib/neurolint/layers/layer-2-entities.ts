
const HTML_ENTITIES: [RegExp, string][] = [
  [/&quot;/g, '"'],
  [/&#x27;/g, "'"],
  [/&apos;/g, "'"],
  [/&amp;/g, "&"],
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&#36;/g, "$"],
  [/&#x24;/g, "$"],
  [/&euro;/g, "€"],
  [/&#8364;/g, "€"],
  [/&#x20AC;/g, "€"],
  [/&pound;/g, "£"],
  [/&#163;/g, "£"],
  [/&yen;/g, "¥"],
  [/&#165;/g, "¥"],
  [/&ndash;/g, "–"],
  [/&#8211;/g, "–"],
  [/&mdash;/g, "—"],
  [/&#8212;/g, "—"],
  [/&#8217;/g, "'"],
  [/&#64;/g, "@"],
  [/&nbsp;/g, " "],
  [/&copy;/g, "©"],
  [/&reg;/g, "®"],
  [/&trade;/g, "™"],
  [/&sect;/g, "§"],
  [/&para;/g, "¶"],
  [/&bull;/g, "•"],
  [/&deg;/g, "°"],
  [/&#8209;/g, "-"],
];

// Advanced pattern fixes for imports and common issues
const PATTERN_FIXES: [RegExp, string | ((match: string, ...args: any[]) => string)][] = [
  // Fix corrupted import statements
  [/import\s*{\s*\n\s*import\s*{([^}]+)}\s*from\s*["']([^"']+)["']/gm, 'import { $1 } from "$2"'],
  
  // Fix React import cleanup
  [/import React,\s*{\s*([^}]+)\s*}\s*from\s*["']react["']/g, 'import { $1 } from "react"'],
  
  // Fix any type assertions
  [/as any\b/g, '// @ts-ignore\n'],
  
  // Fix console.log to console.debug for production
  [/console\.log\(/g, 'console.debug('],
  
  // Fix React Fragment shorthand
  [/<React\.Fragment>/g, '<>'],
  [/<\/React\.Fragment>/g, '</>'],
  
  // Fix component prop destructuring spacing
  [/{\s*([^}]+)\s*}/g, (match, props) => {
    const cleanProps = props.split(',').map((p: string) => p.trim()).join(', ');
    return `{ ${cleanProps} }`;
  }],
  
  // Fix unused useState destructuring
  [/const\s*\[\s*\w+,\s*set\w+\s*\]\s*=\s*useState\([^)]*\);\s*(?=\n|$)/g, (match) => {
    if (!match.includes('set')) return match;
    return match; // Keep as is for now - would need more context
  }],
];

export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply HTML entity fixes
  for (const [pattern, replacement] of HTML_ENTITIES) {
    transformed = transformed.replace(pattern, replacement);
  }
  
  // Apply pattern fixes
  for (const [pattern, replacement] of PATTERN_FIXES) {
    if (typeof replacement === 'function') {
      transformed = transformed.replace(pattern, replacement);
    } else {
      transformed = transformed.replace(pattern, replacement);
    }
  }
  
  // Remove unused imports (basic implementation)
  transformed = removeUnusedImports(transformed);
  
  // Fix import order
  transformed = fixImportOrder(transformed);
  
  return transformed;
}

function removeUnusedImports(code: string): string {
  const lines = code.split('\n');
  const importLines: { line: string; index: number; imports: string[] }[] = [];
  const codeLines: string[] = [];
  
  lines.forEach((line, index) => {
    if (line.trim().startsWith('import ')) {
      const importMatch = line.match(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))/);
      if (importMatch) {
        const [, namedImports, namespaceImport, defaultImport] = importMatch;
        const imports: string[] = [];
        
        if (namedImports) {
          imports.push(...namedImports.split(',').map(imp => imp.trim().split(' as ')[0]));
        }
        if (namespaceImport) imports.push(namespaceImport);
        if (defaultImport) imports.push(defaultImport);
        
        importLines.push({ line, index, imports });
      } else {
        importLines.push({ line, index, imports: [] });
      }
    } else {
      codeLines.push(line);
    }
  });
  
  const codeContent = codeLines.join('\n');
  const usedImports = importLines.filter(({ imports }) => {
    if (imports.length === 0) return true; // Keep side-effect imports
    return imports.some(imp => codeContent.includes(imp));
  });
  
  return [...usedImports.map(({ line }) => line), '', ...codeLines].join('\n');
}

function fixImportOrder(code: string): string {
  const lines = code.split('\n');
  const imports: string[] = [];
  const rest: string[] = [];
  let foundNonImport = false;
  
  lines.forEach(line => {
    if (line.trim().startsWith('import ') && !foundNonImport) {
      imports.push(line);
    } else {
      if (line.trim() && !line.trim().startsWith('//')) {
        foundNonImport = true;
      }
      rest.push(line);
    }
  });
  
  // Sort imports: React first, then external packages, then internal
  const sortedImports = imports.sort((a, b) => {
    const aIsReact = a.includes('react');
    const bIsReact = b.includes('react');
    const aIsInternal = a.includes('@/') || a.includes('./') || a.includes('../');
    const bIsInternal = b.includes('@/') || b.includes('./') || b.includes('../');
    
    if (aIsReact && !bIsReact) return -1;
    if (!aIsReact && bIsReact) return 1;
    if (!aIsInternal && bIsInternal) return -1;
    if (aIsInternal && !bIsInternal) return 1;
    
    return a.localeCompare(b);
  });
  
  return [...sortedImports, '', ...rest].join('\n');
}
