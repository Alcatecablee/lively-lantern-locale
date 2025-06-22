
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

interface SemanticValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  confidence: number;
}

interface ValidationError {
  type: string;
  message: string;
  line?: number;
  severity: 'error' | 'warning' | 'info';
}

interface ValidationWarning {
  type: string;
  message: string;
  suggestion: string;
}

export class AdvancedValidator {
  static async validateTransformation(
    originalCode: string, 
    transformedCode: string,
    context?: any
  ): Promise<SemanticValidationResult> {
    
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];
    
    // Basic syntax validation
    const syntaxValidation = this.validateSyntax(transformedCode);
    if (!syntaxValidation.isValid) {
      errors.push(...syntaxValidation.errors);
    }
    
    // Semantic validation
    const semanticValidation = await this.validateSemantics(originalCode, transformedCode);
    errors.push(...semanticValidation.errors);
    warnings.push(...semanticValidation.warnings);
    
    // React-specific validation
    if (transformedCode.includes('react') || transformedCode.includes('useState')) {
      const reactValidation = this.validateReactPatterns(transformedCode);
      errors.push(...reactValidation.errors);
      warnings.push(...reactValidation.warnings);
    }
    
    // Performance validation
    const performanceValidation = this.validatePerformance(transformedCode);
    warnings.push(...performanceValidation.warnings);
    suggestions.push(...performanceValidation.suggestions);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(errors, warnings, originalCode, transformedCode);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      confidence
    };
  }
  
  private static validateSyntax(code: string): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    
    try {
      parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        strictMode: false,
      });
    } catch (error: any) {
      errors.push({
        type: 'syntax-error',
        message: error.message,
        line: error.loc?.line,
        severity: 'error'
      });
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  private static async validateSemantics(originalCode: string, transformedCode: string): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    try {
      const originalAST = parser.parse(originalCode, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
      const transformedAST = parser.parse(transformedCode, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
      
      // Check for removed functionality
      const originalFunctions = this.extractFunctions(originalAST);
      const transformedFunctions = this.extractFunctions(transformedAST);
      
      const removedFunctions = originalFunctions.filter(func => 
        !transformedFunctions.some(tf => tf.name === func.name)
      );
      
      if (removedFunctions.length > 0) {
        errors.push({
          type: 'functionality-removed',
          message: `Functions removed: ${removedFunctions.map(f => f.name).join(', ')}`,
          severity: 'error'
        });
      }
      
      // Check for broken imports
      const transformedImports = this.extractImports(transformedAST);
      const brokenImports = transformedImports.filter(imp => 
        imp.includes('./') && !imp.includes('components') && !imp.includes('lib')
      );
      
      if (brokenImports.length > 0) {
        warnings.push({
          type: 'potential-broken-imports',
          message: `Potentially broken imports: ${brokenImports.join(', ')}`,
          suggestion: 'Verify import paths exist'
        });
      }
      
    } catch (error) {
      // If we can't parse, that's already caught in syntax validation
    }
    
    return { errors, warnings };
  }
  
  private static validateReactPatterns(code: string): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check for hooks rules violations
    if (code.includes('if (') && code.includes('useState(')) {
      const lines = code.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('if (') && lines[index + 1]?.includes('useState(')) {
          errors.push({
            type: 'hooks-rules-violation',
            message: 'useState called conditionally',
            line: index + 2,
            severity: 'error'
          });
        }
      });
    }
    
    // Check for missing keys in lists
    if (code.includes('.map(') && !code.includes('key=')) {
      warnings.push({
        type: 'missing-keys',
        message: 'List items should have key props',
        suggestion: 'Add unique key prop to list items'
      });
    }
    
    // Check for missing dependencies in useEffect
    const useEffectPattern = /useEffect\(\(\) => \{[^}]+\}, \[(.*?)\]/g;
    let match;
    while ((match = useEffectPattern.exec(code)) !== null) {
      const dependencies = match[1];
      if (!dependencies && code.includes('state')) {
        warnings.push({
          type: 'missing-effect-dependencies',
          message: 'useEffect may be missing dependencies',
          suggestion: 'Add state variables to dependency array'
        });
      }
    }
    
    return { errors, warnings };
  }
  
  private static validatePerformance(code: string): {
    warnings: ValidationWarning[];
    suggestions: string[];
  } {
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];
    
    // Check for expensive operations without memoization
    if (code.includes('.filter(') && code.includes('.map(') && !code.includes('useMemo')) {
      warnings.push({
        type: 'expensive-operations',
        message: 'Chained array operations without memoization',
        suggestion: 'Consider using useMemo for expensive computations'
      });
      suggestions.push('Use useMemo for expensive array operations');
    }
    
    // Check for inline object/function creation
    const inlineObjectPattern = /\w+\s*=\s*\{\s*\w+:/g;
    if (inlineObjectPattern.test(code) && code.includes('render')) {
      suggestions.push('Move object creation outside render or use useMemo');
    }
    
    return { warnings, suggestions };
  }
  
  private static calculateConfidence(
    errors: ValidationError[], 
    warnings: ValidationWarning[],
    originalCode: string,
    transformedCode: string
  ): number {
    let confidence = 1.0;
    
    // Reduce confidence for errors
    confidence -= errors.length * 0.3;
    
    // Reduce confidence for warnings
    confidence -= warnings.length * 0.1;
    
    // Reduce confidence for major code changes
    const changeRatio = Math.abs(transformedCode.length - originalCode.length) / originalCode.length;
    if (changeRatio > 0.5) {
      confidence -= 0.2;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  private static extractFunctions(ast: t.Node): Array<{ name: string; type: string }> {
    const functions: Array<{ name: string; type: string }> = [];
    
    traverse(ast, {
      FunctionDeclaration(path) {
        if (path.node.id) {
          functions.push({
            name: path.node.id.name,
            type: 'function'
          });
        }
      },
      ArrowFunctionExpression(path) {
        if (t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
          functions.push({
            name: path.parent.id.name,
            type: 'arrow'
          });
        }
      }
    });
    
    return functions;
  }
  
  private static extractImports(ast: t.Node): string[] {
    const imports: string[] = [];
    
    traverse(ast, {
      ImportDeclaration(path) {
        if (t.isStringLiteral(path.node.source)) {
          imports.push(path.node.source.value);
        }
      }
    });
    
    return imports;
  }
}
