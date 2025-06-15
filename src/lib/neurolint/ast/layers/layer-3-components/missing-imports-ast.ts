
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTUtils } from '../../utils';

export function addMissingImportsAST(ast: t.File): void {
  try {
    const hooks: string[] = [];
    
    traverse(ast, {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          const name = path.node.callee.name;
          const hookPattern = /^use[A-Z]/;
          if (hookPattern.test(name) && !hooks.includes(name)) {
            hooks.push(name);
          }
        }
      }
    });
    
    if (hooks.length > 0) {
      ASTUtils.addMissingReactImports(ast, hooks);
    }
  } catch (error) {
    console.warn('Error adding missing imports:', error);
  }
}
