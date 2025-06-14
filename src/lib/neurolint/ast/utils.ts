
import * as t from '@babel/types';
import traverse from '@babel/traverse';

export class ASTUtils {
  static needsUseClient(ast: t.File, code: string): boolean {
    const hasReactFeatures = /useState|useEffect|onClick|onChange|onSubmit/.test(code);
    return hasReactFeatures;
  }
  
  static hasUseClientDirective(code: string): boolean {
    return code.includes("'use client'") || code.includes('"use client"');
  }
  
  static addUseClientDirective(ast: t.File): void {
    const useClientDirective = t.expressionStatement(
      t.stringLiteral('use client')
    );
    (useClientDirective as any).directive = 'use client';
    
    ast.program.body.unshift(useClientDirective);
  }
}
