
import * as parser from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';

export class QualityGates {
  static validateSyntax(code: string): { valid: boolean; error?: string } {
    try {
      parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
      });
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown syntax error' 
      };
    }
  }

  static validateNoDoubleWrapping(code: string): boolean {
    // Check for double-wrapped localStorage calls
    const doubleWrapPattern = /typeof window !== "undefined" && typeof window !== "undefined"/g;
    if (doubleWrapPattern.test(code)) {
      return false;
    }

    // Check for nested conditionals around same API
    const nestedLocalStoragePattern = /typeof window[^}]*localStorage[^}]*typeof window[^}]*localStorage/g;
    if (nestedLocalStoragePattern.test(code)) {
      return false;
    }

    return true;
  }

  static validateNoMalformedEventHandlers(code: string): boolean {
    // Check for malformed onClick handlers like "onClick={(e: React.MouseEvent) => () ="
    const malformedPattern = /onClick=\{[^}]*=>/g;
    const matches = code.match(malformedPattern) || [];
    
    for (const match of matches) {
      if (match.includes(') => () =') || match.includes(') =')) {
        return false;
      }
    }
    
    return true;
  }

  static validateImportIntegrity(code: string): boolean {
    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const imports = new Set<string>();
      const usedIdentifiers = new Set<string>();

      // Collect imports
      traverse(ast, {
        ImportDeclaration(path) {
          path.node.specifiers.forEach(spec => {
            if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
              imports.add(spec.imported.name);
            } else if (t.isImportDefaultSpecifier(spec)) {
              imports.add(spec.local.name);
            }
          });
        },
        // Collect used identifiers (hooks, components, etc.)
        CallExpression(path) {
          if (t.isIdentifier(path.node.callee)) {
            usedIdentifiers.add(path.node.callee.name);
          }
        },
        JSXElement(path) {
          if (t.isJSXIdentifier(path.node.openingElement.name)) {
            usedIdentifiers.add(path.node.openingElement.name.name);
          }
        }
      });

      // Check if commonly used React hooks are imported when used
      const reactHooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef'];
      for (const hook of reactHooks) {
        if (usedIdentifiers.has(hook) && !imports.has(hook) && !code.includes(`import React`)) {
          return false;
        }
      }

      return true;
    } catch {
      return false; // If parsing fails, consider import integrity invalid
    }
  }

  static measurePerformanceImpact(originalCode: string, transformedCode: string): {
    sizeIncrease: number;
    complexityIncrease: number;
    impact: 'low' | 'medium' | 'high';
  } {
    const originalSize = originalCode.length;
    const transformedSize = transformedCode.length;
    const sizeIncrease = ((transformedSize - originalSize) / originalSize) * 100;

    // Simple complexity measure: count of conditional expressions, loops, etc.
    const countComplexity = (code: string) => {
      const complexPatterns = [
        /if\s*\(/g, /for\s*\(/g, /while\s*\(/g, /\?\s*:/g, /&&/g, /\|\|/g
      ];
      return complexPatterns.reduce((sum, pattern) => 
        sum + (code.match(pattern) || []).length, 0
      );
    };

    const originalComplexity = countComplexity(originalCode);
    const transformedComplexity = countComplexity(transformedCode);
    const complexityIncrease = transformedComplexity - originalComplexity;

    let impact: 'low' | 'medium' | 'high' = 'low';
    if (sizeIncrease > 50 || complexityIncrease > 10) {
      impact = 'high';
    } else if (sizeIncrease > 20 || complexityIncrease > 5) {
      impact = 'medium';
    }

    return { sizeIncrease, complexityIncrease, impact };
  }
}
