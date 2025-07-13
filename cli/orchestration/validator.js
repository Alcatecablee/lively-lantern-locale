const fs = require('fs');

/**
 * Enhanced Incremental Validation System following the orchestration patterns
 * Provides comprehensive validation without external dependencies
 */
class TransformationValidator {
  
  /**
   * Main validation entry point following the orchestration patterns
   */
  static validateTransformation(before, after) {
    // Skip validation if no changes were made
    if (before === after) {
      return { shouldRevert: false, reason: 'No changes made' };
    }
    
    try {
      // Check for syntax validity
      const syntaxCheck = this.validateSyntax(after);
      if (!syntaxCheck.valid) {
        return { 
          shouldRevert: true, 
          reason: `Syntax error: ${syntaxCheck.error}` 
        };
      }
      
      // Check for code corruption patterns
      const corruptionCheck = this.detectCorruption(before, after);
      if (corruptionCheck.detected) {
        return { 
          shouldRevert: true, 
          reason: `Corruption detected: ${corruptionCheck.pattern}` 
        };
      }
      
      // Check for logical issues
      const logicalCheck = this.validateLogicalIntegrity(before, after);
      if (!logicalCheck.valid) {
        return { 
          shouldRevert: true, 
          reason: `Logical issue: ${logicalCheck.reason}` 
        };
      }
      
      return { shouldRevert: false };
      
    } catch (error) {
      return {
        shouldRevert: true,
        reason: `Validation error: ${error.message}`
      };
    }
  }
  
  /**
   * Parse code to check for syntax errors using multiple approaches
   */
  static validateSyntax(code) {
    try {
      // For JSON files
      if (this.looksLikeJSON(code)) {
        try {
          JSON.parse(code);
          return { valid: true };
        } catch (jsonError) {
          return { 
            valid: false, 
            error: `Invalid JSON: ${jsonError.message}` 
          };
        }
      }
      
      // For JavaScript/TypeScript - basic syntax checks
      const syntaxIssues = this.checkBasicSyntax(code);
      if (syntaxIssues.length > 0) {
        return { 
          valid: false, 
          error: `Syntax issues: ${syntaxIssues.join(', ')}` 
        };
      }
      
      // Advanced syntax validation for JavaScript
      try {
        // Remove TypeScript-specific syntax for basic validation
        const jsCode = this.stripTypeScriptSyntax(code);
        new Function(jsCode);
        return { valid: true };
      } catch (jsError) {
        // If it's a TypeScript file, this might be expected
        if (this.looksLikeTypeScript(code)) {
          // Do TypeScript-specific validation
          return this.validateTypeScriptSyntax(code);
        } else {
          return { 
            valid: false, 
            error: `JavaScript syntax error: ${jsError.message}` 
          };
        }
      }
      
    } catch (error) {
      return { 
        valid: false, 
        error: `Validation failed: ${error.message}` 
      };
    }
  }
  
  /**
   * Check if code looks like JSON
   */
  static looksLikeJSON(code) {
    const trimmed = code.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
           (trimmed.startsWith('[') && trimmed.endsWith(']'));
  }
  
  /**
   * Check if code looks like TypeScript
   */
  static looksLikeTypeScript(code) {
    return /:\s*\w+(\[\])?(\s*\||\s*&|\s*=)/g.test(code) ||
           /interface\s+\w+/g.test(code) ||
           /type\s+\w+\s*=/g.test(code) ||
           /as\s+\w+/g.test(code) ||
           /<\w+>/g.test(code);
  }
  
  /**
   * Basic syntax checking for common issues
   */
  static checkBasicSyntax(code) {
    const issues = [];
    
    // Check for basic bracket/parentheses matching
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack = [];
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      if (Object.keys(brackets).includes(char)) {
        stack.push(char);
      } else if (Object.values(brackets).includes(char)) {
        const last = stack.pop();
        if (!last || brackets[last] !== char) {
          issues.push(`Mismatched ${char} at position ${i}`);
        }
      }
    }
    
    if (stack.length > 0) {
      issues.push(`Unclosed brackets: ${stack.join(', ')}`);
    }
    
    // Check for common syntax errors
    if (/\bfunction\s*\(\s*\)\s*=>\s*\(\s*\)\s*=>/g.test(code)) {
      issues.push('Malformed arrow function syntax');
    }
    
    if (/import\s*{\s*}\s*from\s*from/g.test(code)) {
      issues.push('Duplicate import statement');
    }
    
    return issues;
  }
  
  /**
   * Strip TypeScript syntax for basic JavaScript validation
   */
  static stripTypeScriptSyntax(code) {
    return code
      // Remove type annotations
      .replace(/:\s*\w+(\[\])?(\s*\||\s*&|\s*=)?/g, '')
      // Remove interface declarations
      .replace(/interface\s+\w+\s*{[^}]*}/g, '')
      // Remove type declarations
      .replace(/type\s+\w+\s*=[^;]+;/g, '')
      // Remove generic type parameters
      .replace(/<[^>]+>/g, '')
      // Remove as type assertions
      .replace(/\s+as\s+\w+/g, '');
  }
  
  /**
   * Validate TypeScript syntax (basic checks)
   */
  static validateTypeScriptSyntax(code) {
    // Basic TypeScript syntax validation
    const issues = [];
    
    // Check for common TypeScript syntax errors
    if (/interface\s+\w+\s*{[^}]*$/.test(code)) {
      issues.push('Incomplete interface declaration');
    }
    
    if (/type\s+\w+\s*=\s*$/.test(code)) {
      issues.push('Incomplete type declaration');
    }
    
    if (issues.length > 0) {
      return { 
        valid: false, 
        error: `TypeScript syntax issues: ${issues.join(', ')}` 
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Detect common corruption patterns introduced by faulty transformations
   */
  static detectCorruption(before, after) {
    try {
      const corruptionPatterns = [
        {
          name: 'Double function calls',
          regex: /onClick=\{[^}]*\([^)]*\)\s*=>\s*\(\)\s*=>/g
        },
        {
          name: 'Malformed event handlers',
          regex: /onClick=\{[^}]*\)\([^)]*\)$/g
        },
        {
          name: 'Invalid JSX attributes',
          regex: /\w+=\{[^}]*\)[^}]*\}/g
        },
        {
          name: 'Broken import statements',
          regex: /import\s*{\s*\n\s*import\s*{/g
        },
        {
          name: 'Duplicate function keywords',
          regex: /function\s+function\s+/g
        },
        {
          name: 'Malformed arrow functions',
          regex: /=>\s*=>\s*/g
        },
        {
          name: 'Invalid object syntax',
          regex: /{\s*{\s*[^}]*}\s*}/g
        }
      ];
      
      for (const pattern of corruptionPatterns) {
        // Check if pattern exists in after but not before
        const beforeMatches = (before.match(pattern.regex) || []).length;
        const afterMatches = (after.match(pattern.regex) || []).length;
        
        if (afterMatches > beforeMatches) {
          return { 
            detected: true, 
            pattern: pattern.name 
          };
        }
      }
      
      // Check for severe size reduction (possible content loss)
      const sizeDifference = (before.length - after.length) / before.length;
      if (sizeDifference > 0.8) { // 80% content lost
        return {
          detected: true,
          pattern: 'Severe content loss detected'
        };
      }
      
      return { detected: false };
      
    } catch (error) {
      return { 
        detected: true, 
        pattern: `Corruption detection failed: ${error.message}` 
      };
    }
  }
  
  /**
   * Validate logical integrity of transformations
   */
  static validateLogicalIntegrity(before, after) {
    try {
      // Check that essential imports weren't accidentally removed
      const beforeImports = this.extractImports(before);
      const afterImports = this.extractImports(after);
      
      const removedImports = beforeImports.filter(imp => !afterImports.includes(imp));
      const criticalImports = ['React', 'useState', 'useEffect', 'Component'];
      
      const removedCritical = removedImports.filter(imp => 
        criticalImports.some(critical => imp.includes(critical))
      );
      
      if (removedCritical.length > 0) {
        return {
          valid: false,
          reason: `Critical imports removed: ${removedCritical.join(', ')}`
        };
      }
      
      // Check for function/component removal
      const beforeFunctions = this.extractFunctions(before);
      const afterFunctions = this.extractFunctions(after);
      
      if (beforeFunctions.length > 0 && afterFunctions.length === 0) {
        return {
          valid: false,
          reason: 'All functions/components were removed'
        };
      }
      
      // Check for export removal
      const beforeExports = this.extractExports(before);
      const afterExports = this.extractExports(after);
      
      const removedExports = beforeExports.filter(exp => !afterExports.includes(exp));
      if (removedExports.length > 0 && beforeExports.length > 0) {
        return {
          valid: false,
          reason: `Exports removed: ${removedExports.join(', ')}`
        };
      }
      
      return { valid: true };
      
    } catch (error) {
      return { 
        valid: false, 
        reason: `Integrity check failed: ${error.message}` 
      };
    }
  }
  
  /**
   * Extract import statements from code
   */
  static extractImports(code) {
    try {
      const importRegex = /import\s+.*?\s+from\s+['"][^'"]+['"];?/g;
      return code.match(importRegex) || [];
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Extract function declarations from code
   */
  static extractFunctions(code) {
    try {
      const functionRegex = /(function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>|export\s+(?:default\s+)?function\s+\w+)/g;
      return code.match(functionRegex) || [];
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Extract export statements from code
   */
  static extractExports(code) {
    try {
      const exportRegex = /(export\s+(?:default\s+)?(?:function|const|class|interface)\s+\w+|export\s*{[^}]+})/g;
      return code.match(exportRegex) || [];
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Validate specific file types
   */
  static validateByFileType(code, filePath) {
    if (!filePath) {
      return { valid: true };
    }
    
    const extension = filePath.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'json':
        try {
          JSON.parse(code);
          return { valid: true };
        } catch (error) {
          return { valid: false, error: `JSON error: ${error.message}` };
        }
        
      case 'ts':
      case 'tsx':
        return this.validateTypeScriptSyntax(code);
        
      case 'js':
      case 'jsx':
        return this.validateSyntax(code);
        
      default:
        return { valid: true }; // Unknown file types pass validation
    }
  }
  
  /**
   * Get validation statistics for reporting
   */
  static getValidationStats(before, after) {
    try {
      return {
        sizeDifference: after.length - before.length,
        sizeChangePercent: ((after.length - before.length) / before.length * 100).toFixed(2),
        lineCountBefore: before.split('\n').length,
        lineCountAfter: after.split('\n').length,
        importCountBefore: this.extractImports(before).length,
        importCountAfter: this.extractImports(after).length,
        functionCountBefore: this.extractFunctions(before).length,
        functionCountAfter: this.extractFunctions(after).length
      };
    } catch (error) {
      return {
        error: `Stats calculation failed: ${error.message}`
      };
    }
  }
}

module.exports = TransformationValidator;
