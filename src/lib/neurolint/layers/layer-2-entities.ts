const HTML_ENTITIES: [RegExp, string][] = [
  // Process more specific entities first, then general ones
  [/&quot;/g, '"'],
  [/&#x27;/g, "'"],
  [/&apos;/g, "'"],
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
  // Process &amp; LAST since it contains & which is used in other entities
  [/&amp;/g, "&"],
];

export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply HTML entity fixes with improved logic
  let maxIterations = 5;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    let hasChanges = false;
    const beforeIteration = transformed;
    
    // Apply numeric HTML entity patterns first
    transformed = transformed.replace(/&#(\d+);/g, (match, num) => {
      try {
        const charCode = parseInt(num, 10);
        if (charCode > 0 && charCode < 1114112) {
          return String.fromCharCode(charCode);
        }
        return match;
      } catch {
        return match;
      }
    });
    
    // Apply hex entity patterns
    transformed = transformed.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
      try {
        const charCode = parseInt(hex, 16);
        if (charCode > 0 && charCode < 1114112) {
          return String.fromCharCode(charCode);
        }
        return match;
      } catch {
        return match;
      }
    });
    
    // Apply named HTML entities
    for (const [pattern, replacement] of HTML_ENTITIES) {
      const before = transformed;
      transformed = transformed.replace(pattern, replacement);
      if (before !== transformed) {
        hasChanges = true;
      }
    }
    
    // Exit if no changes were made in this iteration
    if (!hasChanges && beforeIteration === transformed) {
      break;
    }
    
    iteration++;
  }
  
  // Fix var declarations to const/let
  transformed = transformed.replace(/\bvar\s+(\w+)\s*=\s*([^;]+);/g, 'const $1 = $2;');
  
  // Fix console.log to console.debug
  transformed = transformed.replace(/console\.log\(/g, 'console.debug(');
  
  // Clean up imports and remove duplicates - IMPROVED VERSION
  transformed = cleanupImports(transformed);
  
  // Remove duplicate function definitions
  transformed = removeDuplicateFunctions(transformed);
  
  return transformed;
}

function cleanupImports(code: string): string {
  const lines = code.split('\n');
  const imports = new Map<string, string>();
  const rest: string[] = [];
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('import ')) {
      // Extract the import source (what's being imported from)
      const fromMatch = trimmedLine.match(/from\s+['"]([^'"]+)['"]/);
      const importMatch = trimmedLine.match(/import\s+(.+?)\s+from/);
      
      if (fromMatch && importMatch) {
        const source = fromMatch[1];
        const importPart = importMatch[1].trim();
        
        if (imports.has(source)) {
          // Merge imports from the same source
          const existingImport = imports.get(source)!;
          const mergedImport = mergeImports(existingImport, line, source);
          imports.set(source, mergedImport);
        } else {
          imports.set(source, line);
        }
      } else {
        // Handle simple imports like "import React from 'react'"
        const simpleMatch = trimmedLine.match(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
        if (simpleMatch) {
          const [, importName, source] = simpleMatch;
          if (imports.has(source)) {
            // Check if it's the same import
            const existing = imports.get(source)!;
            if (!existing.includes(importName)) {
              // Different import from same source, merge them
              const mergedImport = mergeImports(existing, line, source);
              imports.set(source, mergedImport);
            }
            // If it's exactly the same import, skip it (duplicate)
          } else {
            imports.set(source, line);
          }
        } else {
          // Keep non-standard imports as-is, but check for exact duplicates
          const normalizedImport = trimmedLine.replace(/\s+/g, ' ');
          let isDuplicate = false;
          for (const existingImport of imports.values()) {
            if (existingImport.trim().replace(/\s+/g, ' ') === normalizedImport) {
              isDuplicate = true;
              break;
            }
          }
          if (!isDuplicate) {
            imports.set(`__non_standard_${imports.size}`, line);
          }
        }
      }
    } else {
      rest.push(line);
    }
  });
  
  // Convert map back to array and join
  const cleanedImports = Array.from(imports.values());
  return [...cleanedImports, '', ...rest].join('\n');
}

function mergeImports(existingImport: string, newImport: string, source: string): string {
  try {
    // Extract import parts
    const existingMatch = existingImport.match(/import\s+(.+?)\s+from/);
    const newMatch = newImport.match(/import\s+(.+?)\s+from/);
    
    if (!existingMatch || !newMatch) {
      return existingImport; // Keep existing if we can't parse
    }
    
    const existingPart = existingMatch[1].trim();
    const newPart = newMatch[1].trim();
    
    // Handle different import styles
    if (existingPart.includes('{') && newPart.includes('{')) {
      // Both are named imports
      const existingNamed = existingPart.replace(/[{}]/g, '').split(',').map(s => s.trim());
      const newNamed = newPart.replace(/[{}]/g, '').split(',').map(s => s.trim());
      const merged = [...new Set([...existingNamed, ...newNamed])];
      return `import { ${merged.join(', ')} } from '${source}';`;
    } else if (!existingPart.includes('{') && !newPart.includes('{')) {
      // Both are default imports - keep existing if they're the same
      return existingPart === newPart ? existingImport : existingImport;
    } else {
      // Mixed import types - more complex merging needed
      return existingImport; // Keep existing for now
    }
  } catch (error) {
    console.warn('Error merging imports:', error);
    return existingImport;
  }
}

function removeDuplicateFunctions(code: string): string {
  const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\}/g;
  const functions = new Map<string, string>();
  let match;
  
  // Find all function declarations
  while ((match = functionPattern.exec(code)) !== null) {
    const [fullMatch, funcName] = match;
    if (!functions.has(funcName)) {
      functions.set(funcName, fullMatch);
    }
  }
  
  // Replace all function declarations with unique ones
  let result = code;
  functions.forEach((funcCode, funcName) => {
    const pattern = new RegExp(`function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{[^}]*\\}`, 'g');
    let firstReplacement = true;
    result = result.replace(pattern, (match) => {
      if (firstReplacement) {
        firstReplacement = false;
        return match;
      }
      return ''; // Remove duplicate
    });
  });
  
  return result;
}
