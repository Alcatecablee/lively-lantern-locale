
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTUtils } from '../../utils';

export function fixMissingKeyPropsAST(ast: t.File): void {
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
