
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();

  try {
    return transformer.transform(code, (ast) => {
      // Track if we need to add React import
      let needsReactImport = false;
      let hasReactImport = false;

      // First pass: check existing imports and usage
      traverse(ast, {
        ImportDeclaration(path) {
          if (t.isStringLiteral(path.node.source) && path.node.source.value === 'react') {
            hasReactImport = true;
          }
        },
        CallExpression(path) {
          if (t.isIdentifier(path.node.callee)) {
            const name = path.node.callee.name;
            if (name.startsWith('use') && (name === 'useState' || name === 'useEffect' || name === 'useCallback' || name === 'useMemo')) {
              needsReactImport = true;
            }
          }
        }
      });

      // Second pass: apply transformations
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
              
              // Only process JSX elements
              if (t.isJSXElement(body)) {
                // Check if key prop already exists
                const hasKey = body.openingElement.attributes.some(attr => 
                  t.isJSXAttribute(attr) && 
                  t.isJSXIdentifier(attr.name) && 
                  attr.name.name === 'key'
                );
                
                if (!hasKey) {
                  // Ensure callback has index parameter
                  if (callback.params.length === 1) {
                    callback.params.push(t.identifier('index'));
                  }
                  
                  // Add key prop using index
                  const keyAttr = t.jsxAttribute(
                    t.jsxIdentifier('key'),
                    t.jsxExpressionContainer(t.identifier('index'))
                  );
                  body.openingElement.attributes.unshift(keyAttr);
                }
              }
            }
          }
        },

        // Add missing imports at program level
        Program: {
          exit(path) {
            if (needsReactImport && !hasReactImport) {
              const reactImport = t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier('React'))],
                t.stringLiteral('react')
              );
              path.node.body.unshift(reactImport);
            }
          }
        },

        // Fix accessibility issues
        JSXOpeningElement(path) {
          if (t.isJSXIdentifier(path.node.name) && path.node.name.name === 'button') {
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
