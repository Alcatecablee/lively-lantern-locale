
import * as t from '@babel/types';
import traverse from '@babel/traverse';

export class ASTUtils {
  static hasJSXElements(ast: t.Node): boolean {
    let hasJSX = false;
    try {
      traverse(ast, {
        JSXElement() {
          hasJSX = true;
        },
        JSXFragment() {
          hasJSX = true;
        }
      });
    } catch (error) {
      console.warn('Error checking for JSX elements:', error);
      return false;
    }
    return hasJSX;
  }

  static hasReactHooks(ast: t.Node): boolean {
    let hasHooks = false;
    const hookPattern = /^use[A-Z]/;
    
    try {
      traverse(ast, {
        CallExpression(path) {
          if (t.isIdentifier(path.node.callee) && hookPattern.test(path.node.callee.name)) {
            hasHooks = true;
          }
        }
      });
    } catch (error) {
      console.warn('Error checking for React hooks:', error);
      return false;
    }
    return hasHooks;
  }

  static hasEventHandlers(ast: t.Node): boolean {
    let hasEventHandlers = false;
    const eventPattern = /^on[A-Z]/;
    
    try {
      traverse(ast, {
        JSXAttribute(path) {
          if (t.isJSXIdentifier(path.node.name) && eventPattern.test(path.node.name.name)) {
            hasEventHandlers = true;
          }
        }
      });
    } catch (error) {
      console.warn('Error checking for event handlers:', error);
      return false;
    }
    return hasEventHandlers;
  }

  static hasBrowserAPIs(code: string): boolean {
    return code.includes('localStorage') || 
           code.includes('window.') || 
           code.includes('document.');
  }

  static needsUseClient(ast: t.Node, code: string): boolean {
    return this.hasJSXElements(ast) || 
           this.hasReactHooks(ast) || 
           this.hasEventHandlers(ast) || 
           this.hasBrowserAPIs(code);
  }

  static hasUseClientDirective(code: string): boolean {
    return code.includes("'use client'") || code.includes('"use client"');
  }

  static addUseClientDirective(ast: t.File): void {
    try {
      if (!ast.program.directives.some(d => d.value.value === 'use client')) {
        ast.program.directives.unshift(
          t.directive(t.directiveLiteral('use client'))
        );
      }
    } catch (error) {
      console.warn('Error adding use client directive:', error);
    }
  }

  static findMapCallsWithoutKeys(ast: t.Node): t.CallExpression[] {
    const mapCalls: t.CallExpression[] = [];
    
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
              const body = callback.body;
              if (t.isJSXElement(body) || (t.isBlockStatement(body) && this.returnsJSX(body))) {
                mapCalls.push(path.node);
              }
            }
          }
        }
      });
    } catch (error) {
      console.warn('Error finding map calls:', error);
    }
    
    return mapCalls;
  }

  private static returnsJSX(block: t.BlockStatement): boolean {
    try {
      return block.body.some(stmt => 
        t.isReturnStatement(stmt) && t.isJSXElement(stmt.argument)
      );
    } catch (error) {
      return false;
    }
  }

  static addKeyToJSXElement(element: t.JSXElement, keyValue: t.Expression): void {
    try {
      const hasKey = element.openingElement.attributes.some(attr =>
        t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'key'
      );

      if (!hasKey) {
        element.openingElement.attributes.unshift(
          t.jsxAttribute(
            t.jsxIdentifier('key'),
            t.jsxExpressionContainer(keyValue)
          )
        );
      }
    } catch (error) {
      console.warn('Error adding key to JSX element:', error);
    }
  }

  static getImportDeclarations(ast: t.Node): t.ImportDeclaration[] {
    const imports: t.ImportDeclaration[] = [];
    
    try {
      traverse(ast, {
        ImportDeclaration(path) {
          imports.push(path.node);
        }
      });
    } catch (error) {
      console.warn('Error getting import declarations:', error);
    }
    
    return imports;
  }

  static addMissingReactImports(ast: t.File, hooks: string[]): void {
    try {
      const imports = this.getImportDeclarations(ast);
      const reactImport = imports.find(imp => 
        t.isStringLiteral(imp.source) && imp.source.value === 'react'
      );

      if (!reactImport && hooks.length > 0) {
        const newImport = t.importDeclaration(
          hooks.map(hook => t.importSpecifier(t.identifier(hook), t.identifier(hook))),
          t.stringLiteral('react')
        );
        ast.program.body.unshift(newImport);
      } else if (reactImport) {
        const existingHooks = reactImport.specifiers
          .filter((spec): spec is t.ImportSpecifier => t.isImportSpecifier(spec))
          .map(spec => t.isIdentifier(spec.imported) ? spec.imported.name : '');
        
        const missingHooks = hooks.filter(hook => !existingHooks.includes(hook));
        
        missingHooks.forEach(hook => {
          reactImport.specifiers.push(
            t.importSpecifier(t.identifier(hook), t.identifier(hook))
          );
        });
      }
    } catch (error) {
      console.warn('Error adding missing React imports:', error);
    }
  }
}
