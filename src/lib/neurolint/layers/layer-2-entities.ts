
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
  
  // Fix var declarations to const/let
  [/\bvar\s+(\w+)\s*=\s*([^;]+);/g, 'const $1 = $2;'],
  
  // Fix duplicate function definitions
  [/function\s+(\w+)\s*\([^)]*\)\s*{[^}]*}\s*function\s+\1\s*\([^)]*\)\s*{/g, (match, funcName) => {
    // Remove the first duplicate function declaration
    const secondFuncStart = match.lastIndexOf(`function ${funcName}`);
    return match.substring(secondFuncStart);
  }],
  
  // Clean up extra whitespace and fix formatting
  [/{\s*([^}]+)\s*}/g, (match, content) => {
    if (content.includes('\n')) {
      // Multi-line content - preserve structure but clean up
      const cleaned = content.replace(/\s+/g, ' ').trim();
      return `{ ${cleaned} }`;
    }
    return match;
  }],
];

export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // First, remove duplicate function definitions
  transformed = removeDuplicateFunctions(transformed);
  
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
  
  // Clean up formatting
  transformed = cleanupFormatting(transformed);
  
  return transformed;
}

function removeDuplicateFunctions(code: string): string {
  const lines = code.split('\n');
  const functionDeclarations = new Map<string, number>();
  const linesToRemove = new Set<number>();
  
  // Find duplicate function declarations
  lines.forEach((line, index) => {
    const functionMatch = line.match(/^\s*function\s+(\w+)\s*\(/);
    if (functionMatch) {
      const funcName = functionMatch[1];
      if (functionDeclarations.has(funcName)) {
        // Mark the previous declaration for removal
        const prevIndex = functionDeclarations.get(funcName)!;
        let braceCount = 0;
        let started = false;
        
        // Remove the entire function block
        for (let i = prevIndex; i < lines.length; i++) {
          if (lines[i].includes('{')) {
            started = true;
            braceCount += (lines[i].match(/{/g) || []).length;
          }
          if (lines[i].includes('}')) {
            braceCount -= (lines[i].match(/}/g) || []).length;
          }
          
          linesToRemove.add(i);
          
          if (started && braceCount === 0) {
            break;
          }
        }
      }
      functionDeclarations.set(funcName, index);
    }
  });
  
  // Filter out lines marked for removal
  return lines.filter((_, index) => !linesToRemove.has(index)).join('\n');
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

function cleanupFormatting(code: string): string {
  return code
    // Fix spacing around braces
    .replace(/{\s*([^}]+)\s*}/g, (match, content) => {
      if (content.includes('\n')) {
        return match; // Keep multi-line as is
      }
      return `{ ${content.trim()} }`;
    })
    // Fix excessive newlines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Fix indentation for function bodies
    .replace(/function\s+(\w+)[^{]*{\s*/g, 'function $1() {\n  ')
    // Clean up trailing spaces
    .replace(/[ \t]+$/gm, '');
}
