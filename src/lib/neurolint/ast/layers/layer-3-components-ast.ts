
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export async function transformAST(code: string): Promise<string> {
  console.log('Using proper AST transformations for components');
  
  try {
    // Parse the code into an AST
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      strictMode: false,
      allowUndeclaredExports: true,
      errorRecovery: true,
    });

    let needsReactImport = false;
    const usedHooks = new Set<string>();
    const seenFunctions = new Set<string>();
    const duplicateFunctions: any[] = [];
    let hasJSX = false;

    // First pass: analyze what we need
    traverse(ast, {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          const name = path.node.callee.name;
          if (name === 'useState' || name === 'useEffect') {
            usedHooks.add(name);
            needsReactImport = true;
          }
        }
      },
      
      JSXElement() {
        hasJSX = true;
      },

      FunctionDeclaration(path) {
        const funcName = path.node.id?.name;
        if (funcName) {
          if (seenFunctions.has(funcName)) {
            // Mark for removal
            duplicateFunctions.push(path);
          } else {
            seenFunctions.add(funcName);
          }
        }
      },

      VariableDeclarator(path) {
        if (t.isIdentifier(path.node.id) && path.node.id.name) {
          // Convert var to const
          const declaration = path.findParent((p) => t.isVariableDeclaration(p.node));
          if (declaration && t.isVariableDeclaration(declaration.node) && declaration.node.kind === 'var') {
            declaration.node.kind = 'const';
          }
        }
      }
    });

    // Second pass: make transformations
    traverse(ast, {
      Program(path) {
        // Add missing imports at the top
        if (needsReactImport && usedHooks.size > 0) {
          const existingImports = path.node.body.filter(node => t.isImportDeclaration(node));
          const hasReactImport = existingImports.some(imp => 
            t.isStringLiteral(imp.source) && 
            imp.source.value === 'react'
          );

          if (!hasReactImport) {
            const importSpecifiers = Array.from(usedHooks).map(hook => 
              t.importSpecifier(t.identifier(hook), t.identifier(hook))
            );
            const importDeclaration = t.importDeclaration(
              importSpecifiers,
              t.stringLiteral('react')
            );
            path.node.body.unshift(importDeclaration);
          }
        }

        // Add 'use client' if needed
        const needsUseClient = hasJSX || usedHooks.size > 0;
        const hasUseClient = path.node.body.some(stmt => 
          t.isExpressionStatement(stmt) && 
          t.isStringLiteral(stmt.expression) && 
          stmt.expression.value === 'use client'
        );
        
        if (needsUseClient && !hasUseClient) {
          const useClientDirective = t.expressionStatement(t.stringLiteral('use client'));
          path.node.body.unshift(useClientDirective);
        }
      },

      CallExpression(path) {
        // Add key props to map operations
        if (t.isMemberExpression(path.node.callee) && 
            t.isIdentifier(path.node.callee.property) && 
            path.node.callee.property.name === 'map') {
          
          const callback = path.node.arguments[0];
          if (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) {
            const param = callback.params[0];
            if (t.isIdentifier(param)) {
              // Check if the return value is JSX
              let hasJSXReturn = false;
              
              if (t.isJSXElement(callback.body)) {
                hasJSXReturn = true;
              } else if (t.isBlockStatement(callback.body)) {
                for (const stmt of callback.body.body) {
                  if (t.isReturnStatement(stmt) && t.isJSXElement(stmt.argument)) {
                    hasJSXReturn = true;
                    break;
                  }
                }
              }
              
              if (hasJSXReturn) {
                // Find the JSX element and add key prop
                traverse(callback, {
                  JSXElement(innerPath) {
                    const openingElement = innerPath.node.openingElement;
                    const hasKey = openingElement.attributes.some(attr => 
                      t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'key'
                    );
                    
                    if (!hasKey) {
                      // Add key prop using the parameter name with .id fallback
                      const keyExpression = t.jsxExpressionContainer(
                        t.logicalExpression(
                          '||',
                          t.memberExpression(t.identifier(param.name), t.identifier('id')),
                          t.callExpression(
                            t.memberExpression(t.identifier('Math'), t.identifier('random')),
                            []
                          )
                        )
                      );
                      const keyAttr = t.jsxAttribute(t.jsxIdentifier('key'), keyExpression);
                      openingElement.attributes.unshift(keyAttr);
                    }
                  }
                }, path.scope);
              }
            }
          }
        }

        // Convert console.log to console.debug
        if (t.isMemberExpression(path.node.callee) &&
            t.isIdentifier(path.node.callee.object) &&
            path.node.callee.object.name === 'console' &&
            t.isIdentifier(path.node.callee.property) &&
            path.node.callee.property.name === 'log') {
          path.node.callee.property.name = 'debug';
        }
      },

      JSXElement(path) {
        const openingElement = path.node.openingElement;
        
        // Fix img tags
        if (t.isJSXIdentifier(openingElement.name) && openingElement.name.name === 'img') {
          const hasAlt = openingElement.attributes.some(attr => 
            t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'alt'
          );
          
          if (!hasAlt) {
            const altAttr = t.jsxAttribute(
              t.jsxIdentifier('alt'),
              t.stringLiteral('')
            );
            openingElement.attributes.push(altAttr);
          }
        }

        // Fix button accessibility
        if (t.isJSXIdentifier(openingElement.name) && openingElement.name.name === 'button') {
          const hasAriaLabel = openingElement.attributes.some(attr => 
            t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'aria-label'
          );
          
          if (!hasAriaLabel) {
            const ariaLabelAttr = t.jsxAttribute(
              t.jsxIdentifier('aria-label'),
              t.stringLiteral('Button')
            );
            openingElement.attributes.push(ariaLabelAttr);
          }
        }
      }
    });

    // Remove duplicate functions
    duplicateFunctions.forEach(path => {
      path.remove();
    });

    // Generate TypeScript interfaces for function components
    let result = generate(ast, {
      retainLines: false,
      compact: false,
      comments: true,
    }).code;

    // Add TypeScript interfaces using regex for function components
    const functionPattern = /function\s+(\w+)\s*\(\s*\{\s*([^}]+)\s*\}\s*\)/g;
    const matches = [...result.matchAll(functionPattern)];
    
    for (const match of matches) {
      const componentName = match[1];
      const propsContent = match[2];
      
      // Create interface
      const interfaceName = `${componentName}Props`;
      const props = propsContent.split(',').map(prop => prop.trim() + ': any').join(';\n  ');
      const interfaceDeclaration = `interface ${interfaceName} {\n  ${props};\n}\n\n`;
      
      // Replace function signature
      const newFunctionSignature = `function ${componentName}({ ${propsContent} }: ${interfaceName})`;
      
      result = interfaceDeclaration + result.replace(match[0], newFunctionSignature);
    }

    console.log('AST transformations completed successfully');
    return result;

  } catch (error) {
    console.error('AST transformation failed, falling back to simple regex:', error);
    
    // Fallback to simple transformations
    let transformed = code;
    
    // Simple fallbacks
    transformed = transformed.replace(/&quot;/g, '"');
    transformed = transformed.replace(/&#x27;/g, "'");
    transformed = transformed.replace(/&amp;/g, '&');
    
    if (!transformed.includes("'use client'") && 
        (transformed.includes('useState') || transformed.includes('useEffect') || transformed.includes('onClick'))) {
      transformed = "'use client';\n\n" + transformed;
    }
    
    // Convert var to const
    transformed = transformed.replace(/\bvar\s+/g, 'const ');
    
    // Add basic accessibility
    transformed = transformed.replace(/<img\s+([^>]*?)(?<!alt="[^"]*")\s*>/g, '<img $1 alt="" >');
    transformed = transformed.replace(/<button([^>]*?)>/g, (match, attrs) => {
      if (!attrs.includes('aria-label')) {
        return `<button aria-label="Button"${attrs}>`;
      }
      return match;
    });
    
    return transformed;
  }
}
