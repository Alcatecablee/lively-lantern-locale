export async function transform(code: string): Promise<string> {
  let transformed = code;

  // Apply hydration-specific fixes safely
  transformed = addSSRGuards(transformed);
  transformed = addMountedStates(transformed);
  transformed = addUseClientDirective(transformed);

  return transformed;
}

function addSSRGuards(code: string): string {
  let fixed = code;

  // Fix localStorage access with proper guards
  fixed = fixed.replace(
    /localStorage\.getItem\(/g,
    'typeof window !== "undefined" && localStorage.getItem('
  );

  fixed = fixed.replace(
    /localStorage\.setItem\(/g,
    'typeof window !== "undefined" && localStorage.setItem('
  );

  return fixed;
}

function addMountedStates(code: string): string {
  let fixed = code;

  // Handle window access patterns that need useEffect protection
  if (code.includes('window.') && !code.includes('useEffect')) {
    // Add useEffect import if missing
    if (!fixed.includes('useEffect') && (fixed.includes('useState') || fixed.includes('import'))) {
      fixed = fixed.replace(
        /import { useState } from 'react'/,
        "import { useState, useEffect } from 'react'"
      );
      fixed = fixed.replace(
        /import React/,
        "import React, { useEffect }"
      );
    }

    // Wrap window access in useEffect
    const windowPattern = /(const\s+\w+\s*=\s*window\.[^;]+;)/g;
    fixed = fixed.replace(windowPattern, (match) => {
      const varName = match.match(/const\s+(\w+)/)?.[1] || 'value';
      return `const [${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}] = useState(null);

  useEffect(() => {
    set${varName.charAt(0).toUpperCase() + varName.slice(1)}(window.${varName.replace('const ', '').replace(' =', '')});
  }, []);`;
    });
  }

  // Handle document access patterns
  if (code.includes('document.') && !code.includes('typeof document')) {
    fixed = fixed.replace(
      /document\./g,
      'typeof document !== "undefined" && document.'
    );
  }

  return fixed;
}
          );
        }
      }

      return result;
    }
  }

  return code;
}

function addUseClientDirective(code: string): string {
  const needsUseClient =
    code.includes('useState') ||
    code.includes('useEffect') ||
    code.includes('localStorage') ||
    code.includes('window.') ||
    code.includes('document.') ||
    code.includes('onClick') ||
    code.includes('onChange') ||
    code.includes('onSubmit');

  if (needsUseClient && !code.includes("'use client'") && !code.includes('"use client"')) {
    return "'use client';\n\n" + code;
  }

  return code;
}