
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();

  try {
    return transformer.transform(code, (ast) => {
      traverse(ast, {
        // Fix localStorage and window access without SSR guards
        MemberExpression(path) {
          // Handle localStorage.getItem calls
          if (
            t.isIdentifier(path.node.object) &&
            path.node.object.name === 'localStorage' &&
            t.isIdentifier(path.node.property) &&
            path.node.property.name === 'getItem'
          ) {
            // Check if already wrapped in typeof window check
            let parent = path.parent;
            let hasWindowCheck = false;
            
            while (parent && !hasWindowCheck) {
              if (
                t.isLogicalExpression(parent) &&
                parent.operator === '&&' &&
                t.isBinaryExpression(parent.left) &&
                t.isUnaryExpression(parent.left.left) &&
                parent.left.left.operator === 'typeof' &&
                t.isIdentifier(parent.left.left.argument) &&
                parent.left.left.argument.name === 'window'
              ) {
                hasWindowCheck = true;
              }
              parent = parent.parent;
            }

            if (!hasWindowCheck) {
              // Create typeof window !== "undefined" check
              const windowCheck = t.binaryExpression(
                '!==',
                t.unaryExpression('typeof', t.identifier('window')),
                t.stringLiteral('undefined')
              );

              // Replace the member expression with guarded access
              const guardedAccess = t.logicalExpression(
                '&&',
                windowCheck,
                path.node
              );

              path.replaceWith(guardedAccess);
            }
          }

          // Handle window.matchMedia calls
          if (
            t.isIdentifier(path.node.object) &&
            path.node.object.name === 'window' &&
            t.isIdentifier(path.node.property) &&
            path.node.property.name === 'matchMedia'
          ) {
            // Check if already wrapped in typeof window check
            let parent = path.parent;
            let hasWindowCheck = false;
            
            while (parent && !hasWindowCheck) {
              if (
                t.isLogicalExpression(parent) &&
                parent.operator === '&&' &&
                t.isBinaryExpression(parent.left) &&
                t.isUnaryExpression(parent.left.left) &&
                parent.left.left.operator === 'typeof' &&
                t.isIdentifier(parent.left.left.argument) &&
                parent.left.left.argument.name === 'window'
              ) {
                hasWindowCheck = true;
              }
              parent = parent.parent;
            }

            if (!hasWindowCheck) {
              // Create typeof window !== "undefined" check
              const windowCheck = t.binaryExpression(
                '!==',
                t.unaryExpression('typeof', t.identifier('window')),
                t.stringLiteral('undefined')
              );

              // Replace the member expression with guarded access
              const guardedAccess = t.logicalExpression(
                '&&',
                windowCheck,
                path.node
              );

              path.replaceWith(guardedAccess);
            }
          }

          // Handle document.documentElement calls
          if (
            t.isIdentifier(path.node.object) &&
            path.node.object.name === 'document' &&
            t.isIdentifier(path.node.property) &&
            path.node.property.name === 'documentElement'
          ) {
            // Check if already wrapped in typeof document check
            let parent = path.parent;
            let hasDocumentCheck = false;
            
            while (parent && !hasDocumentCheck) {
              if (
                t.isLogicalExpression(parent) &&
                parent.operator === '&&' &&
                t.isBinaryExpression(parent.left) &&
                t.isUnaryExpression(parent.left.left) &&
                parent.left.left.operator === 'typeof' &&
                t.isIdentifier(parent.left.left.argument) &&
                parent.left.left.argument.name === 'document'
              ) {
                hasDocumentCheck = true;
              }
              parent = parent.parent;
            }

            if (!hasDocumentCheck) {
              // Create typeof document !== "undefined" check
              const documentCheck = t.binaryExpression(
                '!==',
                t.unaryExpression('typeof', t.identifier('document')),
                t.stringLiteral('undefined')
              );

              // Replace the member expression with guarded access
              const guardedAccess = t.logicalExpression(
                '&&',
                documentCheck,
                path.node
              );

              path.replaceWith(guardedAccess);
            }
          }
        },

        // Add mounted state to ThemeProvider components
        FunctionDeclaration(path) {
          if (
            t.isIdentifier(path.node.id) &&
            path.node.id.name.includes('ThemeProvider') &&
            t.isBlockStatement(path.node.body)
          ) {
            // Check if useState is used but mounted state doesn't exist
            let hasUseState = false;
            let hasMountedState = false;

            traverse(path.node, {
              CallExpression(innerPath) {
                if (
                  t.isIdentifier(innerPath.node.callee) &&
                  innerPath.node.callee.name === 'useState'
                ) {
                  hasUseState = true;
                }
              },
              Identifier(innerPath) {
                if (innerPath.node.name === 'mounted') {
                  hasMountedState = true;
                }
              }
            });

            if (hasUseState && !hasMountedState) {
              // Add mounted state and useEffect
              const mountedState = t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.arrayPattern([
                    t.identifier('mounted'),
                    t.identifier('setMounted')
                  ]),
                  t.callExpression(
                    t.identifier('useState'),
                    [t.booleanLiteral(false)]
                  )
                )
              ]);

              const useEffectCall = t.expressionStatement(
                t.callExpression(
                  t.identifier('useEffect'),
                  [
                    t.arrowFunctionExpression(
                      [],
                      t.blockStatement([
                        t.expressionStatement(
                          t.callExpression(
                            t.identifier('setMounted'),
                            [t.booleanLiteral(true)]
                          )
                        )
                      ])
                    ),
                    t.arrayExpression([])
                  ]
                )
              );

              if (t.isBlockStatement(path.node.body)) {
                path.node.body.body.unshift(mountedState, useEffectCall);
              }
            }
          }
        }
      });
    });
  } catch (error) {
    console.warn('AST transformation failed in layer-4-hydration:', error);
    throw error;
  }
}
