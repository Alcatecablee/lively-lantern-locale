
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();

  try {
    return transformer.transform(code, (ast) => {
      traverse(ast, {
        // Fix missing key props in map functions
        CallExpression(path) {
          if (
            t.isMemberExpression(path.node.callee) &&
            t.isIdentifier(path.node.callee.property) &&
            path.node.callee.property.name === 'map'
          ) {
            const callback = path.node.arguments[0];
            if (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) {
              const body = callback.body;
              if (t.isJSXElement(body) || t.isJSXFragment(body)) {
                // Check if key prop already exists
                const hasKey = t.isJSXElement(body) && 
                  body.openingElement.attributes.some(attr => 
                    t.isJSXAttribute(attr) && 
                    t.isJSXIdentifier(attr.name) && 
                    attr.name.name === 'key'
                  );
                
                if (!hasKey && t.isJSXElement(body)) {
                  // Add key prop using index
                  const keyAttr = t.jsxAttribute(
                    t.jsxIdentifier('key'),
                    t.jsxExpressionContainer(
                      t.identifier('index')
                    )
                  );
                  body.openingElement.attributes.unshift(keyAttr);
                  
                  // Ensure callback has index parameter
                  if (callback.params.length === 1) {
                    callback.params.push(t.identifier('index'));
                  }
                }
              }
            }
          }
        },

        // Add missing imports
        Program(path) {
          const body = path.node.body;
          const imports = body.filter(node => t.isImportDeclaration(node));
          const hasReactImport = imports.some(imp => 
            t.isStringLiteral(imp.source) && imp.source.value === 'react'
          );

          // Check if React hooks are used but React is not imported
          let needsReactImport = false;
          traverse(ast, {
            Identifier(innerPath) {
              if (innerPath.node.name.startsWith('use') && 
                  (innerPath.node.name === 'useState' || 
                   innerPath.node.name === 'useEffect' ||
                   innerPath.node.name === 'useCallback' ||
                   innerPath.node.name === 'useMemo')) {
                needsReactImport = true;
              }
            }
          }, path.scope);

          if (needsReactImport && !hasReactImport) {
            const reactImport = t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier('React'))],
              t.stringLiteral('react')
            );
            body.unshift(reactImport);
          }
        },

        // Fix accessibility issues
        JSXOpeningElement(path) {
          if (t.isJSXIdentifier(path.node.name) && 
              path.node.name.name === 'button') {
            
            const hasAriaLabel = path.node.attributes.some(attr =>
              t.isJSXAttribute(attr) &&
              t.isJSXIdentifier(attr.name) &&
              attr.name.name === 'aria-label'
            );

            if (!hasAriaLabel) {
              const ariaLabelAttr = t.jsxAttribute(
                t.jsxIdentifier('aria-label'),
                t.stringLiteral('Button')
              );
              path.node.attributes.push(ariaLabelAttr);
            }
          }
        }
      });
    });
  } catch (error) {
    console.warn('AST transformation failed in layer-3-components:', error);
    throw error;
  }
}
