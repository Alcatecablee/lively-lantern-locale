
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();
  
  try {
    return transformer.transform(code, (ast) => {
      optimizeConsoleStatementsAST(ast);
      addBasicErrorHandlingAST(ast);
    });
  } catch (error) {
    console.warn('AST transform failed for testing layer');
    throw error;
  }
}

function optimizeConsoleStatementsAST(ast: t.File): void {
  traverse(ast, {
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.object) &&
        path.node.callee.object.name === 'console' &&
        t.isIdentifier(path.node.callee.property) &&
        path.node.callee.property.name === 'log'
      ) {
        // Convert console.log to console.debug
        path.node.callee.property.name = 'debug';
      }
    }
  });
}

function addBasicErrorHandlingAST(ast: t.File): void {
  traverse(ast, {
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.object) &&
        path.node.callee.object.name === 'localStorage'
      ) {
        // Check if already wrapped in try-catch
        let parent = path.parent;
        let isInTryCatch = false;
        
        while (parent) {
          if (t.isTryStatement(parent)) {
            isInTryCatch = true;
            break;
          }
          parent = (parent as any).parent;
        }
        
        if (!isInTryCatch) {
          // Wrap in try-catch
          const tryStatement = t.tryStatement(
            t.blockStatement([
              t.expressionStatement(path.node)
            ]),
            t.catchClause(
              t.identifier('e'),
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(t.identifier('console'), t.identifier('warn')),
                    [t.stringLiteral('localStorage error:'), t.identifier('e')]
                  )
                )
              ])
            )
          );
          
          if (t.isExpressionStatement(path.parent)) {
            path.parentPath.replaceWith(tryStatement);
          }
        }
      }
    }
  });
}
