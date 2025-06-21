
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
  // Additional common entities
  [/&minus;/g, "−"],
  [/&times;/g, "×"],
  [/&divide;/g, "÷"],
  [/&plusmn;/g, "±"],
  [/&frac14;/g, "¼"],
  [/&frac12;/g, "½"],
  [/&frac34;/g, "¾"],
  [/&sup1;/g, "¹"],
  [/&sup2;/g, "²"],
  [/&sup3;/g, "³"],
  [/&laquo;/g, "«"],
  [/&raquo;/g, "»"],
  [/&lsquo;/g, "'"],
  [/&rsquo;/g, "'"],
  [/&ldquo;/g, """],
  [/&rdquo;/g, """],
  [/&hellip;/g, "…"],
  [/&middot;/g, "·"],
];

export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply HTML entity fixes
  for (const [pattern, replacement] of HTML_ENTITIES) {
    transformed = transformed.replace(pattern, replacement);
  }
  
  // Fix var declarations to const/let
  transformed = transformed.replace(/\bvar\s+(\w+)\s*=\s*([^;]+);/g, 'const $1 = $2;');
  
  // Fix console.log to console.debug
  transformed = transformed.replace(/console\.log\(/g, 'console.debug(');
  
  // Clean up imports and remove duplicates
  transformed = cleanupImports(transformed);
  
  // Remove duplicate function definitions
  transformed = removeDuplicateFunctions(transformed);
  
  return transformed;
}

function cleanupImports(code: string): string {
  const lines = code.split('\n');
  const imports: string[] = [];
  const rest: string[] = [];
  const seenImports = new Set<string>();
  
  lines.forEach(line => {
    if (line.trim().startsWith('import ')) {
      const normalizedImport = line.trim().replace(/\s+/g, ' ');
      if (!seenImports.has(normalizedImport)) {
        seenImports.add(normalizedImport);
        imports.push(line);
      }
    } else {
      rest.push(line);
    }
  });
  
  return [...imports, '', ...rest].join('\n');
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
