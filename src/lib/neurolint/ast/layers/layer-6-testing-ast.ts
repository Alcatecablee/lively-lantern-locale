
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();

  try {
    return transformer.transform(code, (ast) => {
      traverse(ast, {
        // Add proper prop types for components
        FunctionDeclaration(path) {
          if (
            t.isIdentifier(path.node.id) &&
            path.node.id.name[0] === path.node.id.name[0].toUpperCase() && // Component name starts with uppercase
            path.node.params.length > 0 &&
            t.isObjectPattern(path.node.params[0])
          ) {
            // Check if there's already a TypeScript interface
            let hasInterface = false;
            const parent = path.getFunctionParent() || path.scope.getProgramParent().path;
            
            if (parent && t.isProgram(parent.node)) {
              parent.node.body.forEach(node => {
                if (
                  t.isTSInterfaceDeclaration(node) &&
                  t.isIdentifier(node.id) &&
                  node.id.name.includes('Props')
                ) {
                  hasInterface = true;
                }
              });
            }

            // Add interface if missing (this would need to be done at the program level)
            if (!hasInterface && path.node.id) {
              const componentName = path.node.id.name;
              const interfaceName = `${componentName}Props`;
              
              // Create a simple interface (this is a basic implementation)
              const propsInterface = t.tsInterfaceDeclaration(
                t.identifier(interfaceName),
                null,
                [],
                t.tsInterfaceBody([
                  t.tsPropertySignature(
                    t.identifier('children'),
                    t.tsTypeAnnotation(
                      t.tsUnionType([
                        t.tsTypeReference(t.identifier('React.ReactNode')),
                        t.tsUndefinedKeyword()
                      ])
                    )
                  )
                ])
              );

              // Add interface before the function
              const program = path.scope.getProgramParent().path;
              if (t.isProgram(program.node)) {
                const functionIndex = program.node.body.indexOf(path.node);
                if (functionIndex > -1) {
                  program.node.body.splice(functionIndex, 0, propsInterface);
                }
              }
            }
          }
        },

        // Add error boundaries for risky components
        ExportDefaultDeclaration(path) {
          if (t.isFunctionDeclaration(path.node.declaration)) {
            const funcNode = path.node.declaration;
            if (t.isIdentifier(funcNode.id)) {
              const componentName = funcNode.id.name;
              
              // Check if component contains risky operations
              let hasRiskyOperations = false;
              traverse(funcNode, {
                Identifier(innerPath) {
                  if (
                    innerPath.node.name.includes('PDF') ||
                    innerPath.node.name.includes('upload') ||
                    innerPath.node.name.includes('API') ||
                    innerPath.node.name.includes('fetch')
                  ) {
                    hasRiskyOperations = true;
                  }
                }
              });

              if (hasRiskyOperations) {
                // Create error boundary wrapper
                const errorBoundaryWrapper = t.functionDeclaration(
                  t.identifier(`${componentName}WithErrorBoundary`),
                  [t.identifier('props')],
                  t.blockStatement([
                    t.tryStatement(
                      t.blockStatement([
                        t.returnStatement(
                          t.jsxElement(
                            t.jsxOpeningElement(
                              t.jsxIdentifier(componentName),
                              [
                                t.jsxSpreadAttribute(t.identifier('props'))
                              ]
                            ),
                            t.jsxClosingElement(t.jsxIdentifier(componentName)),
                            [],
                            false
                          )
                        )
                      ]),
                      t.catchClause(
                        t.identifier('error'),
                        t.blockStatement([
                          t.expressionStatement(
                            t.callExpression(
                              t.memberExpression(t.identifier('console'), t.identifier('error')),
                              [t.stringLiteral('Component error:'), t.identifier('error')]
                            )
                          ),
                          t.returnStatement(
                            t.jsxElement(
                              t.jsxOpeningElement(
                                t.jsxIdentifier('div'),
                                [
                                  t.jsxAttribute(
                                    t.jsxIdentifier('className'),
                                    t.stringLiteral('p-4 text-red-600 bg-red-50 rounded-lg')
                                  )
                                ]
                              ),
                              t.jsxClosingElement(t.jsxIdentifier('div')),
                              [t.jsxText('Something went wrong. Please try again.')],
                              false
                            )
                          )
                        ])
                      )
                    )
                  ])
                );

                // Add the wrapper before the original function
                const program = path.scope.getProgramParent().path;
                if (t.isProgram(program.node)) {
                  const exportIndex = program.node.body.indexOf(path.node);
                  if (exportIndex > -1) {
                    program.node.body.splice(exportIndex, 0, errorBoundaryWrapper);
                    
                    // Update the export to use the wrapper
                    path.node.declaration = t.functionDeclaration(
                      funcNode.id,
                      funcNode.params,
                      funcNode.body
                    );
                    
                    // Change export to use wrapper
                    path.replaceWith(
                      t.exportDefaultDeclaration(
                        t.identifier(`${componentName}WithErrorBoundary`)
                      )
                    );
                  }
                }
              }
            }
          }
        }
      });
    });
  } catch (error) {
    console.warn('AST transformation failed in layer-6-testing:', error);
    throw error;
  }
}
