
// Enhanced Incremental Validation System following the patterns
class TransformationValidator {
  
  /**
   * Main validation entry point following the orchestration patterns
   */
  static validateTransformation(before, after) {
    // Skip validation if no changes were made
    if (before === after) {
      return { shouldRevert: false, reason: 'No changes made' };
    }
    
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
  }
  
  /**
   * Parse code to check for syntax errors
   */
  static validateSyntax(code) {
    try {
      // Basic syntax validation using built-in parsing
      new Function(code);
      return { valid: true };
    } catch (error) {
      // Try as module syntax
      try {
        new Function(`"use strict"; ${code}`);
        return { valid: true };
      } catch (moduleError) {
        return { 
          valid: false, 
          error: error.message || 'Unknown syntax error'
        };
      }
    }
  }
  
  /**
   * Detect common corruption patterns introduced by faulty transformations
   */
  static detectCorruption(before, after) {
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
        name: 'Duplicate variable declarations',
        regex: /const\s+(\w+).*\n.*const\s+\1/g
      }
    ];
    
    for (const pattern of corruptionPatterns) {
      // Check if pattern exists in after but not before
      if (pattern.regex.test(after) && !pattern.regex.test(before)) {
        return { 
          detected: true, 
          pattern: pattern.name 
        };
      }
    }
    
    return { detected: false };
  }
  
  /**
   * Validate logical integrity of transformations
   */
  static validateLogicalIntegrity(before, after) {
    // Check that essential imports weren't accidentally removed
    const beforeImports = this.extractImports(before);
    const afterImports = this.extractImports(after);
    
    const removedImports = beforeImports.filter(imp => !afterImports.includes(imp));
    const criticalImports = ['React', 'useState', 'useEffect'];
    
    const removedCritical = removedImports.filter(imp => 
      criticalImports.some(critical => imp.includes(critical))
    );
    
    if (removedCritical.length > 0) {
      return {
        valid: false,
        reason: `Critical imports removed: ${removedCritical.join(', ')}`
      };
    }
    
    // Check for significant size changes (might indicate corruption)
    const sizeDiff = Math.abs(after.length - before.length) / before.length;
    if (sizeDiff > 0.5) { // More than 50% size change
      return {
        valid: false,
        reason: 'Significant size change detected, possible corruption'
      };
    }
    
    return { valid: true };
  }
  
  static extractImports(code) {
    const importRegex = /import\s+.*?\s+from\s+['"][^'"]+['"]/g;
    return code.match(importRegex) || [];
  }
}

module.exports = TransformationValidator;
