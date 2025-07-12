
// AST vs Regex Fallback Strategy implementation
class ASTFallbackStrategy {
  
  /**
   * Smart transformation strategy with AST preference
   * Falls back gracefully when AST parsing fails
   */
  static async transformWithFallback(code, layer, options = {}) {
    
    // Layers 1-2: Always use regex (config files, simple patterns)
    if (!layer.supportsAST) {
      if (options.verbose) {
        console.log(`📝 Using regex transformation for ${layer.name}`);
      }
      return await layer.regexTransform(code);
    }
    
    // Layers 3-4: Try AST first, fallback to regex
    try {
      if (layer.supportsAST && options.useAST !== false) {
        if (options.verbose) {
          console.log(`🌳 Using AST transformation for ${layer.name}`);
        }
        return await this.transformWithAST(code, layer);
      }
    } catch (astError) {
      console.warn(`⚠️  AST failed for ${layer.name}, using regex fallback:`, astError.message);
      
      // AST failed, use regex-based transformation
      if (layer.regexTransform) {
        if (options.verbose) {
          console.log(`🔄 Falling back to regex for ${layer.name}`);
        }
        return await layer.regexTransform(code);
      } else {
        throw new Error(`No fallback available for layer ${layer.name}`);
      }
    }
    
    return code;
  }
  
  /**
   * AST transformation wrapper with error handling
   */
  static async transformWithAST(code, layer) {
    // For CLI implementation, we'll use a simplified AST approach
    // In production, this would integrate with @babel/parser
    
    try {
      // Attempt to parse as JavaScript/TypeScript
      const ast = this.parseCode(code);
      
      // Apply layer-specific AST transformations
      const transformed = this.applyASTTransformations(ast, code, layer);
      
      return transformed;
      
    } catch (error) {
      console.warn('AST parsing failed:', error.message);
      throw new Error(`AST transformation failed: ${error.message}`);
    }
  }
  
  /**
   * Simplified AST parsing for CLI environment
   */
  static parseCode(code) {
    // This is a simplified approach for the CLI
    // In a full implementation, you'd use @babel/parser
    
    try {
      // Try to parse as a function to validate syntax
      new Function(code);
      return { valid: true, code };
    } catch (error) {
      throw new Error(`Syntax error in code: ${error.message}`);
    }
  }
  
  /**
   * Apply AST transformations based on layer type
   */
  static applyASTTransformations(ast, code, layer) {
    switch (layer.id) {
      case 3:
        return this.applyComponentTransformations(code);
      case 4:
        return this.applyHydrationTransformations(code);
      default:
        throw new Error(`AST not supported for layer ${layer.id}`);
    }
  }
  
  /**
   * Component layer AST transformations
   */
  static applyComponentTransformations(code) {
    let transformed = code;
    
    // Add missing keys to map functions (AST-aware approach)
    transformed = this.addMissingKeys(transformed);
    
    // Add missing imports (AST-aware approach)
    transformed = this.addMissingImports(transformed);
    
    return transformed;
  }
  
  /**
   * Hydration layer AST transformations
   */
  static applyHydrationTransformations(code) {
    let transformed = code;
    
    // Add SSR guards (AST-aware approach)
    transformed = this.addSSRGuards(transformed);
    
    // Add mounted states for components
    transformed = this.addMountedStates(transformed);
    
    return transformed;
  }
  
  /**
   * AST-aware key addition for React elements
   */
  static addMissingKeys(code) {
    // More sophisticated pattern matching for AST-like behavior
    return code.replace(
      /\.map\s*\(\s*([^)]+)\s*=>\s*<([^>]+)(?![^>]*key=)/g,
      (match, mapArg, element) => {
        const keyVar = mapArg.includes(',') ? mapArg.split(',')[1].trim() : 'index';
        return match.replace(`<${element}`, `<${element} key={${keyVar}}`);
      }
    );
  }
  
  /**
   * AST-aware import addition
   */
  static addMissingImports(code) {
    let transformed = code;
    
    // Check if React hooks are used but not imported
    if (transformed.includes('useState') && !transformed.includes('import { useState')) {
      const reactImportMatch = transformed.match(/import React[^;]*;/);
      if (reactImportMatch) {
        transformed = transformed.replace(
          reactImportMatch[0],
          `import React, { useState } from 'react';`
        );
      } else {
        transformed = `import { useState } from 'react';\n${transformed}`;
      }
    }
    
    return transformed;
  }
  
  /**
   * AST-aware SSR guard addition
   */
  static addSSRGuards(code) {
    // Add typeof window checks for localStorage usage
    return code.replace(
      /localStorage\.(\w+)\s*\(/g,
      (match, method) => {
        return `(typeof window !== 'undefined' ? localStorage.${method}( : null`;
      }
    );
  }
  
  /**
   * Add mounted states for hydration safety
   */
  static addMountedStates(code) {
    // This would be more sophisticated in a real AST implementation
    if (code.includes('localStorage') && !code.includes('mounted')) {
      // Add basic mounted state pattern
      const mountedPattern = `
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;
`;
      return code.replace(/return\s*\(/, `${mountedPattern}\n  return (`);
    }
    
    return code;
  }
}

module.exports = ASTFallbackStrategy;
