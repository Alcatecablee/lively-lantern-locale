
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';
import { ASTUtils } from '../utils';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();
  
  try {
    return transformer.transform(code, (ast) => {
      addMissingImportsAST(ast);
      fixMissingKeyPropsAST(ast);
      fixAccessibilityAttributesAST(ast);
      addComponentInterfacesAST(ast);
    });
  } catch (error) {
    console.warn('AST transform failed, using fallback');
    throw error;
  }
}

function addMissingImportsAST(ast: t.File): void {
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
}

function fixMissingKeyPropsAST(ast: t.File): void {
  traverse(ast, {
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.property) &&
        path.node.callee.property.name === 'map'
      ) {
        const callback = path.node.arguments[0];
        if (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) {
          const params = callback.params;
          const itemParam = params[0];
          const indexParam = params[1];
          
          // Find JSX elements in callback
          traverse(callback, {
            JSXElement(jsxPath) {
              const element = jsxPath.node;
              const hasKey = element.openingElement.attributes.some(attr =>
                t.isJSXAttribute(attr) && 
                t.isJSXIdentifier(attr.name) && 
                attr.name.name === 'key'
              );
              
              if (!hasKey) {
                let keyValue: t.Expression;
                
                if (indexParam && t.isIdentifier(indexParam)) {
                  keyValue = t.identifier(indexParam.name);
                } else if (itemParam && t.isIdentifier(itemParam)) {
                  keyValue = t.logicalExpression(
                    '||',
                    t.logicalExpression(
                      '||',
                      t.memberExpression(t.identifier(itemParam.name), t.identifier('id')),
                      t.memberExpression(t.identifier(itemParam.name), t.identifier('name'))
                    ),
                    t.callExpression(
                      t.memberExpression(t.identifier('Math'), t.identifier('random')),
                      []
                    )
                  );
                } else {
                  keyValue = t.callExpression(
                    t.memberExpression(t.identifier('Math'), t.identifier('random')),
                    []
                  );
                }
                
                ASTUtils.addKeyToJSXElement(element, keyValue);
              }
            }
          });
        }
      }
    }
  });
}

function fixAccessibilityAttributesAST(ast: t.File): void {
  traverse(ast, {
    JSXElement(path) {
      const element = path.node;
      const openingElement = element.openingElement;
      
      if (t.isJSXIdentifier(openingElement.name)) {
        const tagName = openingElement.name.name;
        
        // Add alt to images
        if (tagName === 'img') {
          const hasAlt = openingElement.attributes.some(attr =>
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'alt'
          );
          
          if (!hasAlt) {
            openingElement.attributes.push(
              t.jsxAttribute(t.jsxIdentifier('alt'), t.stringLiteral(''))
            );
          }
        }
        
        // Add aria-label to buttons without existing aria attributes or text content
        if (tagName === 'button') {
          const hasAriaLabel = openingElement.attributes.some(attr =>
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            (attr.name.name === 'aria-label' || attr.name.name === 'aria-labelledby')
          );
          
          // Check if button has text content
          const hasTextContent = element.children && element.children.some(child => 
            t.isJSXText(child) && child.value.trim() ||
            t.isJSXExpressionContainer(child) ||
            t.isJSXElement(child)
          );
          
          if (!hasAriaLabel && !hasTextContent) {
            openingElement.attributes.push(
              t.jsxAttribute(t.jsxIdentifier('aria-label'), t.stringLiteral('Button'))
            );
          }
        }
      }
    }
  });
}

function addComponentInterfacesAST(ast: t.File): void {
  traverse(ast, {
    FunctionDeclaration(path) {
      const func = path.node;
      if (func.params.length > 0) {
        const firstParam = func.params[0];
        if (t.isObjectPattern(firstParam) && func.id) {
          const componentName = func.id.name;
          const interfaceName = `${componentName}Props`;
          
          // Check if interface already exists
          const hasInterface = ast.program.body.some(stmt =>
            t.isTSInterfaceDeclaration(stmt) && stmt.id.name === interfaceName
          );
          
          if (!hasInterface) {
            const props = firstParam.properties.map(prop => {
              if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                return t.tsPropertySignature(
                  t.identifier(prop.key.name),
                  t.tsTypeAnnotation(t.tsAnyKeyword())
                );
              }
              return null;
            }).filter(Boolean) as t.TSPropertySignature[];
            
            const interfaceDecl = t.tsInterfaceDeclaration(
              t.identifier(interfaceName),
              null,
              null,
              t.tsInterfaceBody(props)
            );
            
            // Add interface before the function
            const funcIndex = ast.program.body.indexOf(path.node);
            ast.program.body.splice(funcIndex, 0, interfaceDecl);
            
            // Update function parameter type
            if (t.isObjectPattern(firstParam)) {
              firstParam.typeAnnotation = t.tsTypeAnnotation(
                t.tsTypeReference(t.identifier(interfaceName))
              );
            }
          }
        }
      }
    }
  });
}
