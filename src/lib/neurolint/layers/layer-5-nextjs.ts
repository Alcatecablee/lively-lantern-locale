
export async function transform(code: string, filePath?: string): Promise<string> {
  let transformed = code;
  
  // Apply Next.js specific fixes in order of importance
  transformed = fixCorruptedImports(transformed);
  transformed = fixMisplacedUseClientDirectives(transformed);
  transformed = addMissingUseClient(transformed);
  transformed = fixImportOrder(transformed);
  transformed = fixReactImportIssues(transformed);
  transformed = fixAppRouterPatterns(transformed);
  transformed = cleanupDeprecatedOptions(transformed);
  
  return transformed;
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

function fixMisplacedUseClientDirectives(code: string): string {
  const lines = code.split('\n');
  const useClientIndices = [];
  
  // Find all 'use client' directives
  lines.forEach((line, index) => {
    if (line.trim() === "'use client';" || line.trim() === '"use client";') {
      useClientIndices.push(index);
    }
  });
  
  if (useClientIndices.length === 0) return code;
  
  // Check if 'use client' is misplaced (not at the top)
  const firstUseClientIndex = useClientIndices[0];
  let isMisplaced = false;
  
  for (let i = 0; i < firstUseClientIndex; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('//') && !line.startsWith('/*')) {
      isMisplaced = true;
      break;
    }
  }
  
  if (!isMisplaced && useClientIndices.length === 1) return code;
  
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

function addMissingUseClient(code: string): string {
  const hasHooks = /use(State|Effect|Router|Context|Reducer|Callback|Memo|Ref|ImperativeHandle|LayoutEffect|DebugValue)/.test(code);
  const hasUseClient = code.includes("'use client'") || code.includes('"use client"');
  const isComponent = code.includes('export default function') || code.includes('export function');
  const hasEventHandlers = /on[A-Z]\w+\s*=/g.test(code);
  const hasBrowserAPIs = code.includes('localStorage') || code.includes('window.') || code.includes('document.');
  const hasThemeProvider = code.includes('ThemeProvider');
  const hasClientOnlyFeatures = code.includes('useMediaQuery') || code.includes('matchMedia');
  
  if ((hasHooks || hasEventHandlers || hasBrowserAPIs || hasThemeProvider || hasClientOnlyFeatures) && !hasUseClient && isComponent) {
    return "'use client';\n\n" + code;
  }
  
  return code;
}

function fixImportOrder(code: string): string {
  if (code.startsWith("'use client';")) {
    // Ensure proper spacing after 'use client'
    let fixed = code.replace(/^'use client';\n+/, "'use client';\n\n");
    
    // Ensure React import comes after 'use client' if hooks are used
    if ((code.includes('useState') || code.includes('useEffect')) && !code.includes('import React')) {
      const lines = fixed.split('\n');
      const useClientIndex = lines.findIndex(line => line.trim() === "'use client';");
      
      if (useClientIndex !== -1) {
        // Add React import after 'use client' if not present
        const hasReactImport = lines.some(line => line.includes('import React'));
        if (!hasReactImport) {
          lines.splice(useClientIndex + 2, 0, "import React from 'react';");
          fixed = lines.join('\n');
        }
      }
    }
    
    return fixed;
  }
  
  return code;
}

function fixReactImportIssues(code: string): string {
  // Add React import for components using hooks without explicit React import
  if (code.includes("'use client'") && 
      !code.includes('import React') && 
      (code.includes('useState') || code.includes('useEffect') || code.includes('useContext'))) {
    
    const lines = code.split('\n');
    const useClientIndex = lines.findIndex(line => line.trim() === "'use client';");
    
    if (useClientIndex !== -1) {
      // Insert React import after 'use client'
      lines.splice(useClientIndex + 1, 0, '', "import React from 'react';");
      return lines.join('\n');
    }
  }
  
  return code;
}

function fixAppRouterPatterns(code: string): string {
  let fixed = code;
  
  // Fix page.tsx exports - ensure they export default function Page
  if (code.includes('export default function') && code.includes('Page')) {
    fixed = fixed.replace(
      /export default function (\w*Page\w*)/g,
      'export default function Page'
    );
  }
  
  // Fix layout.tsx exports - ensure they export default function Layout
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
  
  // Fix loading.tsx exports
  if (code.includes('export default function') && code.includes('Loading')) {
    fixed = fixed.replace(
      /export default function (\w*Loading\w*)/g,
      'export default function Loading'
    );
  }
  
  // Fix error.tsx exports
  if (code.includes('export default function') && code.includes('Error')) {
    fixed = fixed.replace(
      /export default function (\w*Error\w*)/g,
      'export default function Error'
    );
  }
  
  return fixed;
}

function cleanupDeprecatedOptions(code: string): string {
  let fixed = code;
  
  // Remove deprecated appDir from experimental in next.config.js
  if (code.includes('experimental') && code.includes('appDir')) {
    fixed = fixed.replace(/appDir:\s*true,?\s*/g, '');
    fixed = fixed.replace(/experimental:\s*{\s*},?/g, '');
  }
  
  // Fix deprecated Image domains to remotePatterns
  if (code.includes('domains:') && code.includes('images:')) {
    fixed = fixed.replace(
      /domains:\s*\[(.*?)\]/gs,
      (match, domains) => {
        const domainList = domains.split(',').map(d => d.trim().replace(/['"]/g, ''));
        const remotePatterns = domainList.map(domain => 
          `{\n      protocol: 'https',\n      hostname: '${domain}'\n    }`
        ).join(',\n    ');
        return `remotePatterns: [\n    ${remotePatterns}\n  ]`;
      }
    );
  }
  
  return fixed;
}
