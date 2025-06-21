
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
    console.warn('AST transform failed for layer-3-components, using fallback');
    throw error;
  }
}

function addMissingImportsAST(ast: t.File): void {
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

function fixMissingKeyPropsAST(ast: t.File): void {
  try {
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
            
            // Find JSX elements in callback body
            const callbackBody = callback.body;
            
            if (t.isBlockStatement(callbackBody)) {
              traverse(callbackBody, {
                JSXElement(innerPath) {
                  addKeyIfMissing(innerPath.node, itemParam, indexParam);
                }
              });
            } else if (t.isJSXElement(callbackBody)) {
              addKeyIfMissing(callbackBody, itemParam, indexParam);
            }
          }
        }
      }
    });
  } catch (error) {
    console.warn('Error fixing missing key props:', error);
  }
}

function addKeyIfMissing(element: t.JSXElement, itemParam: any, indexParam: any): void {
  try {
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
  } catch (error) {
    console.warn('Error adding key to element:', error);
  }
}

function fixAccessibilityAttributesAST(ast: t.File): void {
  try {
    traverse(ast, {
      JSXElement(path) {
        const element = path.node;
        const openingElement = element.openingElement;
        
        if (t.isJSXIdentifier(openingElement.name)) {
          const tagName = openingElement.name.name;
          
          // Add alt to images if missing
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
          
          // Add aria-label to buttons without existing aria attributes or meaningful text content
          if (tagName === 'button') {
            const hasAriaLabel = openingElement.attributes.some(attr =>
              t.isJSXAttribute(attr) && 
              t.isJSXIdentifier(attr.name) && 
              (attr.name.name === 'aria-label' || attr.name.name === 'aria-labelledby')
            );
            
            if (!hasAriaLabel) {
              // Check if button has meaningful text content
              const hasTextContent = element.children.some(child => {
                if (t.isJSXText(child)) {
                  return child.value.trim() !== '';
                }
                // For JSX expressions, assume they provide meaningful content
                return t.isJSXExpressionContainer(child);
              });
              
              // Only add aria-label if there's no meaningful text content
              if (!hasTextContent) {
                openingElement.attributes.push(
                  t.jsxAttribute(t.jsxIdentifier('aria-label'), t.stringLiteral('Button'))
                );
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.warn('Error fixing accessibility attributes:', error);
  }
}

function addComponentInterfacesAST(ast: t.File): void {
  try {
    const functionsToProcess: Array<{func: t.FunctionDeclaration, index: number}> = [];
    
    // First pass: collect functions that need interfaces
    ast.program.body.forEach((stmt, index) => {
      if (t.isFunctionDeclaration(stmt) && stmt.params.length > 0) {
        const firstParam = stmt.params[0];
        if (t.isObjectPattern(firstParam) && stmt.id) {
          const componentName = stmt.id.name;
          const interfaceName = `${componentName}Props`;
          
          // Check if interface already exists
          const hasInterface = ast.program.body.some(s =>
            t.isTSInterfaceDeclaration(s) && s.id.name === interfaceName
          );
          
          if (!hasInterface) {
            functionsToProcess.push({func: stmt, index});
          }
        }
      }
    });
    
    // Second pass: add interfaces (in reverse order to maintain indices)
    functionsToProcess.reverse().forEach(({func, index}) => {
      if (func.id && func.params[0] && t.isObjectPattern(func.params[0])) {
        const componentName = func.id.name;
        const interfaceName = `${componentName}Props`;
        const firstParam = func.params[0];
        
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
        ast.program.body.splice(index, 0, interfaceDecl);
        
        // Update function parameter type
        firstParam.typeAnnotation = t.tsTypeAnnotation(
          t.tsTypeReference(t.identifier(interfaceName))
        );
      }
    });
  } catch (error) {
    console.warn('Error adding component interfaces:', error);
  }
}
