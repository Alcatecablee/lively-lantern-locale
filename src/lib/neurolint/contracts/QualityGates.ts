
import * as parser from '@babel/parser';

export class QualityGates {
  static validateSyntax(code: string): { valid: boolean; error?: string } {
    try {
      parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        strictMode: false,
        allowUndeclaredExports: true,
        errorRecovery: true,
      });
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown syntax error' 
      };
    }
  }

  static validateNoMalformedEventHandlers(code: string): boolean {
    // Check for common malformed event handler patterns
    const malformedPatterns = [
      /onClick=\{[^}]*\(\)[^}]*\}/g, // onClick={someFunc()} instead of onClick={someFunc}
      /on[A-Z]\w*=\{[^}]*\(\)\s*\}/g, // Any event handler with immediate function call
    ];
    
    for (const pattern of malformedPatterns) {
      if (pattern.test(code)) {
        return false;
      }
    }
    return true;
  }

  static validateImportIntegrity(code: string): boolean {
    const usedHooks = [];
    const importedHooks = [];
    
    // Find used hooks
    const hookMatches = code.match(/\b(useState|useEffect|useContext|useReducer|useCallback|useMemo)\b/g);
    if (hookMatches) {
      usedHooks.push(...hookMatches);
    }
    
    // Find imported hooks
    const importMatches = code.match(/import\s*\{[^}]*\}\s*from\s*['"]react['"]/g);
    if (importMatches) {
      for (const match of importMatches) {
        const hooksInImport = match.match(/\b(useState|useEffect|useContext|useReducer|useCallback|useMemo)\b/g);
        if (hooksInImport) {
          importedHooks.push(...hooksInImport);
        }
      }
    }
    
    // Check if all used hooks are imported
    const uniqueUsedHooks = [...new Set(usedHooks)];
    const uniqueImportedHooks = [...new Set(importedHooks)];
    
    return uniqueUsedHooks.every(hook => uniqueImportedHooks.includes(hook));
  }

  static validateNoDoubleWrapping(code: string): boolean {
    // Check for nested typeof window checks
    const doubleWrapPattern = /typeof window[^;]*typeof window/g;
    return !doubleWrapPattern.test(code);
  }

  static measurePerformanceImpact(before: string, after: string): {
    sizeIncrease: number;
    complexityIncrease: number;
    impact: 'low' | 'medium' | 'high';
  } {
    const sizeIncrease = after.length - before.length;
    const complexityIncrease = (after.split('\n').length - before.split('\n').length);
    
    let impact: 'low' | 'medium' | 'high' = 'low';
    if (sizeIncrease > 500 || complexityIncrease > 10) {
      impact = 'high';
    } else if (sizeIncrease > 200 || complexityIncrease > 5) {
      impact = 'medium';
    }
    
    return {
      sizeIncrease,
      complexityIncrease,
      impact
    };
  }
}
