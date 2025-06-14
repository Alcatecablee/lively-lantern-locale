
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply Next.js specific fixes
  transformed = fixUseClientDirectives(transformed);
  transformed = fixCorruptedImports(transformed);
  transformed = addMissingUseClient(transformed);
  transformed = fixImportOrder(transformed);
  transformed = fixAppRouterPatterns(transformed);
  
  return transformed;
}

function fixUseClientDirectives(code: string): string {
  const lines = code.split('\n');
  const useClientIndices = [];
  
  // Find all 'use client' directives
  lines.forEach((line, index) => {
    if (line.trim() === "'use client';" || line.trim() === '"use client";') {
      useClientIndices.push(index);
    }
  });
  
  if (useClientIndices.length === 0) return code;
  
  // Remove all 'use client' directives
  const filteredLines = lines.filter(line => 
    line.trim() !== "'use client';" && line.trim() !== '"use client";'
  );
  
  // Find the first non-comment, non-empty line
  let insertIndex = 0;
  for (let i = 0; i < filteredLines.length; i++) {
    const line = filteredLines[i].trim();
    if (line && !line.startsWith('//') && !line.startsWith('/*')) {
      insertIndex = i;
      break;
    }
  }
  
  // Insert 'use client' at the top
  filteredLines.splice(insertIndex, 0, "'use client';", '');
  
  return filteredLines.join('\n');
}

function fixCorruptedImports(code: string): string {
  let fixed = code;
  
  // Fix pattern: import {\n import { ... } from "..."
  fixed = fixed.replace(
    /import\s*{\s*\n\s*import\s*{([^}]+)}\s*from\s*["']([^"']+)["']/gm,
    'import { $1 } from "$2"'
  );
  
  // Fix pattern: import {\n  SomeComponent,\n} from "..."
  fixed = fixed.replace(
    /import\s*{\s*\n\s*([^}]+)\n\s*}\s*from\s*["']([^"']+)["']/gm,
    'import {\n  $1\n} from "$2"'
  );
  
  // Fix standalone import { without closing
  fixed = fixed.replace(/^import\s*{\s*$/gm, '');
  
  // Clean up duplicate imports
  const lines = fixed.split('\n');
  const cleanedLines = [];
  const seenImports = new Set();
  
  for (const line of lines) {
    if (line.trim().startsWith('import ')) {
      const importKey = line.trim().replace(/\s+/g, ' ');
      if (!seenImports.has(importKey)) {
        seenImports.add(importKey);
        cleanedLines.push(line);
      }
    } else {
      cleanedLines.push(line);
    }
  }
  
  return cleanedLines.join('\n');
}

function addMissingUseClient(code: string): string {
  const hasHooks = /use(State|Effect|Router|Context|Reducer|Callback|Memo|Ref|ImperativeHandle|LayoutEffect|DebugValue)/.test(code);
  const hasUseClient = code.includes("'use client'") || code.includes('"use client"');
  const isComponent = code.includes('export default function') || code.includes('export function');
  const hasEventHandlers = /on[A-Z]\w+=/g.test(code);
  const hasBrowserAPIs = code.includes('localStorage') || code.includes('window.') || code.includes('document.');
  
  if ((hasHooks || hasEventHandlers || hasBrowserAPIs) && !hasUseClient && isComponent) {
    return "'use client';\n\n" + code;
  }
  
  return code;
}

function fixImportOrder(code: string): string {
  if (code.startsWith("'use client';")) {
    // Ensure proper spacing after 'use client'
    return code.replace(/^'use client';\n+/, "'use client';\n\n");
  }
  
  return code;
}

function fixAppRouterPatterns(code: string): string {
  let fixed = code;
  
  // Fix page.tsx exports
  if (code.includes('export default function') && code.includes('Page')) {
    fixed = fixed.replace(
      /export default function (\w*Page\w*)/g,
      'export default function Page'
    );
  }
  
  // Fix layout.tsx exports
  if (code.includes('export default function') && code.includes('Layout')) {
    fixed = fixed.replace(
      /export default function (\w*Layout\w*)/g,
      'export default function Layout'
    );
  }
  
  // Add metadata export for pages if missing
  if (code.includes('export default function Page') && !code.includes('export const metadata')) {
    const metadataExport = `export const metadata = {
  title: 'Page Title',
  description: 'Page description',
};

`;
    fixed = metadataExport + fixed;
  }
  
  return fixed;
}
