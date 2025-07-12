
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();

  try {
    return transformer.transform(code, (ast) => {
      traverse(ast, {
        // Combined SSR guards for localStorage and window access
        MemberExpression(path) {
          // Handle localStorage access
          if (
            t.isIdentifier(path.node.object) &&
            path.node.object.name === 'localStorage' &&
            t.isIdentifier(path.node.property)
          ) {
            // Check if already wrapped in typeof window check
            let parent = path.parent;
            let hasTypeofCheck = false;
            
            while (parent && !hasTypeofCheck) {
              if (t.isBinaryExpression(parent) &&
                  parent.operator === '!==' &&
                  t.isUnaryExpression(parent.left) &&
                  parent.left.operator === 'typeof' &&
                  t.isIdentifier(parent.left.argument) &&
                  parent.left.argument.name === 'window') {
                hasTypeofCheck = true;
              }
              parent = path.parentPath?.parent;
            }

            if (!hasTypeofCheck) {
              // Wrap in typeof window check
              const typeofCheck = t.binaryExpression(
                '!==',
                t.unaryExpression('typeof', t.identifier('window')),
                t.stringLiteral('undefined')
              );

              const logicalAnd = t.logicalExpression(
                '&&',
                typeofCheck,
                path.node
              );

              path.replaceWith(logicalAnd);
            }
          }

          // Handle window.matchMedia access
          if (
            t.isIdentifier(path.node.object) &&
            path.node.object.name === 'window' &&
            t.isIdentifier(path.node.property) &&
            path.node.property.name === 'matchMedia'
          ) {
            // Check if already wrapped in typeof window check
            let parent = path.parent;
            let hasTypeofCheck = false;
            
            while (parent && !hasTypeofCheck) {
              if (t.isBinaryExpression(parent) &&
                  parent.operator === '!==' &&
                  t.isUnaryExpression(parent.left) &&
                  parent.left.operator === 'typeof' &&
                  t.isIdentifier(parent.left.argument) &&
                  parent.left.argument.name === 'window') {
                hasTypeofCheck = true;
              }
              parent = path.parentPath?.parent;
            }

            if (!hasTypeofCheck) {
              // Wrap in typeof window check
              const typeofCheck = t.binaryExpression(
                '!==',
                t.unaryExpression('typeof', t.identifier('window')),
                t.stringLiteral('undefined')
              );

              const logicalAnd = t.logicalExpression(
                '&&',
                typeofCheck,
                path.node
              );

              path.replaceWith(logicalAnd);
            }
          }
        },

        // Add mounted state for theme providers
        FunctionDeclaration(path) {
          if (t.isIdentifier(path.node.id) &&
              path.node.id.name.includes('Provider')) {
            
            // Check if component uses ThemeProvider
            let hasThemeProvider = false;
            traverse(path.node, {
              JSXIdentifier(innerPath) {
                if (innerPath.node.name === 'ThemeProvider') {
                  hasThemeProvider = true;
                }
              }
            });

            if (hasThemeProvider) {
              // Add mounted state logic
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
