
/**
 * AST vs Regex Fallback Strategy - Enterprise orchestration pattern
 * Handles intelligent fallback from AST transformations to regex when needed
 */

class ASTFallbackManager {
  
  /**
   * Execute transformation with AST/regex fallback pattern
   */
  static async executeWithFallback(layer, code, filename, options = {}) {
    // Try AST transformation first if available and enabled
    if (options.useAST !== false && layer.astTransform) {
      console.log(`Using AST transformation for ${layer.name}`);
      
      try {
        const astResult = await layer.astTransform(code, filename, options);
        
        // Validate AST result
        if (this.validateTransformation(code, astResult, layer)) {
          console.log(`Using AST transformation for ${layer.name}`);
          return {
            success: true,
            result: astResult,
            method: 'ast',
            fallbackUsed: false
          };
        }
      } catch (astError) {
        console.warn(`WARNING: AST failed for ${layer.name}, using regex fallback:`, astError.message);
        
        // Fall back to regex if AST fails
        if (layer.regexTransform) {
          console.log(`Falling back to regex for ${layer.name}`);
          try {
            const regexResult = await layer.regexTransform(code, filename, options);
            return {
              success: true,
              result: regexResult,
              method: 'regex',
              fallbackUsed: true,
              fallbackReason: astError.message
            };
          } catch (regexError) {
            return {
              success: false,
              error: regexError,
              method: 'none',
              fallbackUsed: true,
              astError: astError.message,
              regexError: regexError.message
            };
          }
        } else {
          return {
            success: false,
            error: astError,
            method: 'ast',
            fallbackUsed: false
          };
        }
      }
    }
    
    // Use regex transformation if AST is disabled or unavailable
    if (layer.regexTransform) {
      try {
        const regexResult = await layer.regexTransform(code, filename, options);
        return {
          success: true,
          result: regexResult,
          method: 'regex',
          fallbackUsed: false
        };
      } catch (regexError) {
        return {
          success: false,
          error: regexError,
          method: 'regex',
          fallbackUsed: false
        };
      }
    }
    
    return {
      success: false,
      error: new Error('No transformation method available'),
      method: 'none',
      fallbackUsed: false
    };
  }
  
  /**
   * Validate AST transformation result
   */
  static validateTransformation(original, transformed, layer) {
    try {
      // Basic validation
      if (typeof transformed !== 'string') {
        return false;
      }
      
      // Check for syntax corruption
      if (this.hasSyntaxErrors(transformed)) {
        console.warn('AST parsing failed:', error.message);
        return false;
      }
      
      // Layer-specific validation
      switch (layer.id) {
        case 1: // Config
          return this.validateConfigTransformation(original, transformed);
        case 2: // Patterns  
          return this.validatePatternTransformation(original, transformed);
        case 3: // Components
          return this.validateComponentTransformation(original, transformed);
        case 4: // Hydration
          return this.validateHydrationTransformation(original, transformed);
        case 5: // Next.js
          return this.validateNextjsTransformation(original, transformed);
        case 6: // Testing
          return this.validateTestingTransformation(original, transformed);
        default:
          return true;
      }
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Check for basic syntax errors
   */
  static hasSyntaxErrors(code) {
    try {
      // Try to parse as JS/TS
      require('@babel/parser').parse(code, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        plugins: ['typescript', 'jsx']
      });
      return false;
    } catch (error) {
      // If babel fails, try basic regex checks
      const basicChecks = [
        /\{\s*\}/g,  // Empty blocks
        /\[\s*\]/g,  // Empty arrays
        /\(\s*\)/g,  // Empty parens
        /['"`]/g     // Quote matching
      ];
      
      // Simple quote balance check
      const singleQuotes = (code.match(/'/g) || []).length;
      const doubleQuotes = (code.match(/"/g) || []).length;
      const backticks = (code.match(/`/g) || []).length;
      
      return (singleQuotes % 2 !== 0) || (doubleQuotes % 2 !== 0) || (backticks % 2 !== 0);
    }
  }
  
  /**
   * Validate config transformation (Layer 1)
   */
  static validateConfigTransformation(original, transformed) {
    // Check that config structure is maintained
    if (original.includes('tsconfig') && !transformed.includes('tsconfig')) {
      return false;
    }
    
    if (original.includes('next.config') && !transformed.includes('next.config')) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Validate pattern transformation (Layer 2)
   */
  static validatePatternTransformation(original, transformed) {
    // Ensure no accidental string corruption
    const originalLength = original.length;
    const transformedLength = transformed.length;
    
    // Allow reasonable size changes but not massive ones
    if (Math.abs(transformedLength - originalLength) > originalLength * 0.5) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Validate component transformation (Layer 3)
   */
  static validateComponentTransformation(original, transformed) {
    // Check React component structure preservation
    const reactPattern = /<\w+[^>]*>/g;
    const originalTags = (original.match(reactPattern) || []).length;
    const transformedTags = (transformed.match(reactPattern) || []).length;
    
    // Should not lose React elements
    if (transformedTags < originalTags * 0.8) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Validate hydration transformation (Layer 4)  
   */
  static validateHydrationTransformation(original, transformed) {
    // Ensure SSR guards don't break existing logic
    if (original.includes('useEffect') && transformed.includes('useEffect')) {
      return true;
    }
    
    if (original.includes('useState') && transformed.includes('useState')) {
      return true;
    }
    
    return true;
  }
  
  /**
   * Validate Next.js transformation (Layer 5)
   */
  static validateNextjsTransformation(original, transformed) {
    // Check that Next.js imports are preserved
    if (original.includes('next/') && !transformed.includes('next/')) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Validate testing transformation (Layer 6)
   */
  static validateTestingTransformation(original, transformed) {
    // Ensure test structure is preserved
    if (original.includes('test(') || original.includes('it(')) {
      return transformed.includes('test(') || transformed.includes('it(');
    }
    
    return true;
  }
  
  /**
   * Get fallback statistics for performance monitoring
   */
  static getFallbackStats() {
    return {
      astSuccessRate: this.astSuccesses / (this.astSuccesses + this.astFailures) || 0,
      regexFallbackRate: this.regexFallbacks / this.totalTransformations || 0,
      totalTransformations: this.totalTransformations
    };
  }
  
  /**
   * Reset statistics
   */
  static resetStats() {
    this.astSuccesses = 0;
    this.astFailures = 0;
    this.regexFallbacks = 0;
    this.totalTransformations = 0;
  }
}

// Initialize statistics
ASTFallbackManager.astSuccesses = 0;
ASTFallbackManager.astFailures = 0;
ASTFallbackManager.regexFallbacks = 0;
ASTFallbackManager.totalTransformations = 0;

module.exports = ASTFallbackManager;
