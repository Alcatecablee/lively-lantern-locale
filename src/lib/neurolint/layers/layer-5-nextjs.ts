
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply Next.js specific fixes - avoid duplicating work from other layers
  transformed = fixCorruptedImports(transformed);
  transformed = fixImportOrder(transformed);
  transformed = fixAppRouterPatterns(transformed);
  transformed = addUseClientIfNeeded(transformed);
  
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

function addUseClientIfNeeded(code: string): string {
  // Only add 'use client' if not already present and actually needed
  if (code.includes("'use client'") || code.includes('"use client"')) {
    return code;
  }

  const needsUseClient = 
    code.includes('useState') ||
    code.includes('useEffect') ||
    code.includes('localStorage') ||
    code.includes('window.') ||
    code.includes('document.') ||
    code.includes('onClick') ||
    code.includes('onChange') ||
    code.includes('onSubmit');
  
  if (needsUseClient) {
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
