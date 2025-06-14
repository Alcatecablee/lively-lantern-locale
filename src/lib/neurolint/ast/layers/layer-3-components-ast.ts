
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
          const varName = path.node.id.name;
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
        if (needsReactImport) {
          const existingImports = path.node.body.filter(node => t.isImportDeclaration(node));
          const hasReactImport = existingImports.some(imp => 
            t.isStringLiteral(imp.source) && 
            imp.source.value === 'react' &&
            imp.specifiers?.some(spec => 
              t.isImportSpecifier(spec) && 
              (usedHooks.has((spec.imported as t.Identifier).name))
            )
          );

          if (!hasReactImport && usedHooks.size > 0) {
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
        const needsUseClient = code.includes('useState') || code.includes('useEffect') || 
                              code.includes('onClick') || code.includes('onChange');
        const hasUseClient = code.includes("'use client'") || code.includes('"use client"');
        
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
          if (t.isArrowFunctionExpression(callback) && callback.params.length > 0) {
            const param = callback.params[0];
            if (t.isIdentifier(param)) {
              // Check if the return value is JSX
              if (t.isJSXElement(callback.body) || 
                  (t.isBlockStatement(callback.body) && 
                   callback.body.body.some(stmt => 
                     t.isReturnStatement(stmt) && t.isJSXElement(stmt.argument)))) {
                
                // Add key prop logic would go here
                // For now, we'll handle this in a simpler way
              }
            }
          }
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

    // Generate the transformed code
    const result = generate(ast, {
      retainLines: false,
      compact: false,
      comments: true,
    });

    console.log('AST transformations completed successfully');
    return result.code;

  } catch (error) {
    console.error('AST transformation failed, falling back to simple regex:', error);
    
    // Fallback to simple transformations
    let transformed = code;
    
    // Simple fallbacks
    transformed = transformed.replace(/&quot;/g, '"');
    transformed = transformed.replace(/&#x27;/g, "'");
    transformed = transformed.replace(/&amp;/g, '&');
    
    if (!transformed.includes("'use client'") && 
        (transformed.includes('useState') || transformed.includes('useEffect'))) {
      transformed = "'use client';\n\n" + transformed;
    }
    
    return transformed;
  }
}
