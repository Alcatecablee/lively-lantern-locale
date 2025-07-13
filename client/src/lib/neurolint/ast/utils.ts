
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

  static findImports(ast: t.Node): string[] {
    const imports: string[] = [];
    try {
      traverse(ast, {
        ImportDeclaration(path) {
          if (t.isStringLiteral(path.node.source)) {
            imports.push(path.node.source.value);
          }
        }
      });
    } catch (error) {
      console.warn('Error finding imports:', error);
    }
    return imports;
  }

  static hasImport(ast: t.Node, importName: string): boolean {
    let hasImport = false;
    try {
      traverse(ast, {
        ImportDeclaration(path) {
          if (t.isStringLiteral(path.node.source) && path.node.source.value === importName) {
            hasImport = true;
          }
        }
      });
    } catch (error) {
      console.warn('Error checking for import:', error);
    }
    return hasImport;
  }

  static isComponentFunction(node: t.Node): boolean {
    if (t.isFunctionDeclaration(node) && t.isIdentifier(node.id)) {
      const name = node.id.name;
      return name[0] === name[0].toUpperCase(); // Component names start with uppercase
    }
    if (t.isVariableDeclarator(node) && t.isIdentifier(node.id)) {
      const name = node.id.name;
      return name[0] === name[0].toUpperCase();
    }
    return false;
  }

  static findComponentFunctions(ast: t.Node): t.FunctionDeclaration[] {
    const components: t.FunctionDeclaration[] = [];
    try {
      traverse(ast, {
        FunctionDeclaration(path) {
          if (this.isComponentFunction(path.node)) {
            components.push(path.node);
          }
        }
      });
    } catch (error) {
      console.warn('Error finding component functions:', error);
    }
    return components;
  }

  static createSafeIdentifier(name: string): t.Identifier {
    // Ensure the identifier name is valid
    const safeName = name.replace(/[^a-zA-Z0-9_$]/g, '_');
    return t.identifier(safeName);
  }

  static createSafeStringLiteral(value: string): t.StringLiteral {
    // Escape quotes and other special characters
    const safeValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return t.stringLiteral(safeValue);
  }

  static isSSRSafeExpression(node: t.Node): boolean {
    // Check if an expression is safe for SSR (doesn't use window, document, localStorage, etc.)
    let isSSRSafe = true;
    try {
      traverse(node, {
        Identifier(path) {
          const name = path.node.name;
          if (name === 'window' || name === 'document' || name === 'localStorage' || name === 'sessionStorage') {
            // Check if it's already wrapped in a typeof check
            let parent = path.parent;
            let hasTypeofCheck = false;
            
            while (parent && !hasTypeofCheck) {
              if (
                t.isBinaryExpression(parent) &&
                t.isUnaryExpression(parent.left) &&
                parent.left.operator === 'typeof' &&
                t.isIdentifier(parent.left.argument) &&
                parent.left.argument.name === name
              ) {
                hasTypeofCheck = true;
              }
              parent = (parent as any).parent;
            }
            
            if (!hasTypeofCheck) {
              isSSRSafe = false;
            }
          }
        }
      });
    } catch (error) {
      console.warn('Error checking SSR safety:', error);
      return false;
    }
    return isSSRSafe;
  }
}

export default ASTUtils;
