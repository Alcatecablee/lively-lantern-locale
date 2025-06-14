
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';
import { ASTUtils } from '../utils';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();
  
  try {
    return transformer.transform(code, (ast) => {
      addSSRGuardsAST(ast);
      addMountedStatesAST(ast);
      addUseClientDirectiveAST(ast, code);
    });
  } catch (error) {
    console.warn('AST transform failed, using fallback');
    throw error;
  }
}

function addSSRGuardsAST(ast: t.File): void {
  traverse(ast, {
    MemberExpression(path) {
      const node = path.node;
      if (
        t.isIdentifier(node.object) &&
        node.object.name === 'localStorage' &&
        t.isIdentifier(node.property)
      ) {
        // Only wrap if not already wrapped
        if (
          !t.isLogicalExpression(path.parent) ||
          !t.isBinaryExpression((path.parent as t.LogicalExpression).left)
        ) {
          // Wrap localStorage calls with typeof window check
          const typeofCheck = t.binaryExpression(
            '!==',
            t.unaryExpression('typeof', t.identifier('window')),
            t.stringLiteral('undefined')
          );
          
          const guardedAccess = t.logicalExpression('&&', typeofCheck, node);
          path.replaceWith(guardedAccess);
        }
      }
    }
  });
}

function addMountedStatesAST(ast: t.File): void {
  let hasLocalStorage = false;
  let hasUseState = false;
  let hasMountedState = false;
  
  // Check if component uses localStorage and useState
  traverse(ast, {
    MemberExpression(path) {
      if (
        t.isIdentifier(path.node.object) &&
        path.node.object.name === 'localStorage'
      ) {
        hasLocalStorage = true;
      }
    },
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'useState') {
        hasUseState = true;
      }
    },
    VariableDeclarator(path) {
      if (
        t.isArrayPattern(path.node.id) &&
        path.node.id.elements.length >= 1 &&
        t.isIdentifier(path.node.id.elements[0]) &&
        path.node.id.elements[0].name === 'mounted'
      ) {
        hasMountedState = true;
      }
    }
  });
  
  if (hasLocalStorage && hasUseState && !hasMountedState) {
    // Add mounted state and useEffect
    traverse(ast, {
      FunctionDeclaration(path) {
        const body = path.node.body.body;
        
        // Add mounted state at the beginning
        const mountedState = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.arrayPattern([
              t.identifier('mounted'),
              t.identifier('setMounted')
            ]),
            t.callExpression(t.identifier('useState'), [t.booleanLiteral(false)])
          )
        ]);
        
        // Add mount effect
        const mountEffect = t.expressionStatement(
          t.callExpression(t.identifier('useEffect'), [
            t.arrowFunctionExpression(
              [],
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(t.identifier('setMounted'), [t.booleanLiteral(true)])
                )
              ])
            ),
            t.arrayExpression([])
          ])
        );
        
        body.unshift(mountedState, mountEffect);
        path.stop();
      }
    });
  }
}

function addUseClientDirectiveAST(ast: t.File, code: string): void {
  if (ASTUtils.needsUseClient(ast, code) && !ASTUtils.hasUseClientDirective(code)) {
    ASTUtils.addUseClientDirective(ast);
  }
}
