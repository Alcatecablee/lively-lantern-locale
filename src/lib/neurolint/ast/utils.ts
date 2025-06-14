
import * as t from '@babel/types';
import traverse from '@babel/traverse';

export class ASTUtils {
  static hasJSXElements(ast: t.Node): boolean {
    let hasJSX = false;
    traverse(ast, {
      JSXElement() {
        hasJSX = true;
      },
      JSXFragment() {
        hasJSX = true;
      }
    });
    return hasJSX;
  }

  static hasReactHooks(ast: t.Node): boolean {
    let hasHooks = false;
    const hookPattern = /^use[A-Z]/;
    
    traverse(ast, {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee) && hookPattern.test(path.node.callee.name)) {
          hasHooks = true;
        }
      }
    });
    return hasHooks;
  }

  static hasEventHandlers(ast: t.Node): boolean {
    let hasEventHandlers = false;
    const eventPattern = /^on[A-Z]/;
    
    traverse(ast, {
      JSXAttribute(path) {
        if (t.isJSXIdentifier(path.node.name) && eventPattern.test(path.node.name.name)) {
          hasEventHandlers = true;
        }
      }
    });
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
    if (!ast.program.directives.some(d => d.value.value === 'use client')) {
      ast.program.directives.unshift(
        t.directive(t.directiveLiteral('use client'))
      );
    }
  }

  static findMapCallsWithoutKeys(ast: t.Node): t.CallExpression[] {
    const mapCalls: t.CallExpression[] = [];
    
    traverse(ast, {
      CallExpression(path) {
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'map'
        ) {
          // Check if the callback returns JSX without key prop
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
    
    return mapCalls;
  }

  private static returnsJSX(block: t.BlockStatement): boolean {
    return block.body.some(stmt => 
      t.isReturnStatement(stmt) && t.isJSXElement(stmt.argument)
    );
  }

  static addKeyToJSXElement(element: t.JSXElement, keyValue: t.Expression): void {
    // Check if key already exists
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
  }

  static getImportDeclarations(ast: t.Node): t.ImportDeclaration[] {
    const imports: t.ImportDeclaration[] = [];
    
    traverse(ast, {
      ImportDeclaration(path) {
        imports.push(path.node);
      }
    });
    
    return imports;
  }

  static addMissingReactImports(ast: t.File, hooks: string[]): void {
    const imports = this.getImportDeclarations(ast);
    const reactImport = imports.find(imp => 
      t.isStringLiteral(imp.source) && imp.source.value === 'react'
    );

    if (!reactImport && hooks.length > 0) {
      // Add new React import
      const newImport = t.importDeclaration(
        hooks.map(hook => t.importSpecifier(t.identifier(hook), t.identifier(hook))),
        t.stringLiteral('react')
      );
      ast.program.body.unshift(newImport);
    } else if (reactImport) {
      // Add missing hooks to existing import
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
  }
}
