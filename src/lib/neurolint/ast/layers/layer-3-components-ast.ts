
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';
import { ASTUtils } from '../utils';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();
  
  try {
    return transformer.transform(code, (ast) => {
      addMissingImportsAST(ast, code);
      addMissingKeyPropsAST(ast);
      convertVarToConstAST(ast);
      addTypeScriptInterfacesAST(ast);
      addAccessibilityAttributesAST(ast);
      removeDuplicateFunctionsAST(ast);
    });
  } catch (error) {
    console.warn('AST transform failed for components layer:', error);
    throw error;
  }
}

function addMissingImportsAST(ast: t.File, code: string): void {
  const hasUseState = code.includes('useState');
  const hasUseEffect = code.includes('useEffect');
  let hasReactImport = false;
  let hasHooksImport = false;
  
  // Check existing imports
  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (source === 'react') {
        if (path.node.specifiers.some(spec => 
          t.isImportDefaultSpecifier(spec) || 
          (t.isImportSpecifier(spec) && 
           ((t.isIdentifier(spec.imported) && spec.imported.name === 'useState') ||
            (t.isIdentifier(spec.imported) && spec.imported.name === 'useEffect')))
        )) {
          hasReactImport = true;
          if (path.node.specifiers.some(spec => 
            t.isImportSpecifier(spec) && 
            ((t.isIdentifier(spec.imported) && spec.imported.name === 'useState') ||
             (t.isIdentifier(spec.imported) && spec.imported.name === 'useEffect'))
          )) {
            hasHooksImport = true;
          }
        }
      }
    }
  });
  
  if ((hasUseState || hasUseEffect) && !hasHooksImport) {
    const imports = [];
    if (hasUseState) imports.push('useState');
    if (hasUseEffect) imports.push('useEffect');
    
    const importSpecifiers = imports.map(name => 
      t.importSpecifier(t.identifier(name), t.identifier(name))
    );
    
    const importDeclaration = t.importDeclaration(
      importSpecifiers,
      t.stringLiteral('react')
    );
    
    ast.program.body.unshift(importDeclaration);
  }
}

function addMissingKeyPropsAST(ast: t.File): void {
  traverse(ast, {
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.property) &&
        path.node.callee.property.name === 'map' &&
        path.node.arguments.length > 0
      ) {
        const callback = path.node.arguments[0];
        if (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) {
          const body = callback.body;
          if (t.isJSXElement(body)) {
            // Direct JSX return
            if (!body.openingElement.attributes.some(attr => 
              t.isJSXAttribute(attr) && 
              t.isJSXIdentifier(attr.name) && 
              attr.name.name === 'key'
            )) {
              const keyAttribute = t.jsxAttribute(
                t.jsxIdentifier('key'),
                t.jsxExpressionContainer(
                  t.logicalExpression(
                    '||',
                    t.memberExpression(
                      callback.params[0] as t.Identifier,
                      t.identifier('id')
                    ),
                    t.callExpression(
                      t.memberExpression(t.identifier('Math'), t.identifier('random')),
                      []
                    )
                  )
                )
              );
              body.openingElement.attributes.push(keyAttribute);
            }
          } else if (t.isBlockStatement(body)) {
            // Block statement with return
            body.body.forEach(stmt => {
              if (t.isReturnStatement(stmt) && t.isJSXElement(stmt.argument)) {
                if (!stmt.argument.openingElement.attributes.some(attr => 
                  t.isJSXAttribute(attr) && 
                  t.isJSXIdentifier(attr.name) && 
                  attr.name.name === 'key'
                )) {
                  const keyAttribute = t.jsxAttribute(
                    t.jsxIdentifier('key'),
                    t.jsxExpressionContainer(
                      t.logicalExpression(
                        '||',
                        t.memberExpression(
                          callback.params[0] as t.Identifier,
                          t.identifier('id')
                        ),
                        t.callExpression(
                          t.memberExpression(t.identifier('Math'), t.identifier('random')),
                          []
                        )
                      )
                    )
                  );
                  stmt.argument.openingElement.attributes.push(keyAttribute);
                }
              }
            });
          }
        }
      }
    }
  });
}

function convertVarToConstAST(ast: t.File): void {
  traverse(ast, {
    VariableDeclaration(path) {
      if (path.node.kind === 'var') {
        path.node.kind = 'const';
      }
    }
  });
}

function addTypeScriptInterfacesAST(ast: t.File): void {
  const interfacesToAdd: t.TSInterfaceDeclaration[] = [];
  
  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.params.length > 0) {
        const firstParam = path.node.params[0];
        if (t.isObjectPattern(firstParam)) {
          const componentName = path.node.id?.name;
          if (componentName) {
            const interfaceName = `${componentName}Props`;
            
            const properties = firstParam.properties.map(prop => {
              if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                return t.tsPropertySignature(
                  t.identifier(prop.key.name),
                  t.tsTypeAnnotation(t.tsAnyKeyword())
                );
              }
              return null;
            }).filter(Boolean) as t.TSPropertySignature[];
            
            if (properties.length > 0) {
              const interfaceDeclaration = t.tsInterfaceDeclaration(
                t.identifier(interfaceName),
                null,
                null,
                t.tsInterfaceBody(properties)
              );
              
              interfacesToAdd.push(interfaceDeclaration);
              
              // Update function parameter
              firstParam.typeAnnotation = t.tsTypeAnnotation(
                t.tsTypeReference(t.identifier(interfaceName))
              );
            }
          }
        }
      }
    }
  });
  
  // Add interfaces at the beginning
  interfacesToAdd.reverse().forEach(interfaceDecl => {
    ast.program.body.unshift(interfaceDecl as any);
  });
}

function addAccessibilityAttributesAST(ast: t.File): void {
  traverse(ast, {
    JSXElement(path) {
      const element = path.node;
      if (t.isJSXIdentifier(element.openingElement.name)) {
        const tagName = element.openingElement.name.name;
        
        if (tagName === 'img') {
          const hasAlt = element.openingElement.attributes.some(attr => 
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'alt'
          );
          
          if (!hasAlt) {
            const altAttribute = t.jsxAttribute(
              t.jsxIdentifier('alt'),
              t.stringLiteral('')
            );
            element.openingElement.attributes.push(altAttribute);
          }
        }
        
        if (tagName === 'button') {
          const hasAriaLabel = element.openingElement.attributes.some(attr => 
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'aria-label'
          );
          
          // Only add aria-label if button doesn't have text content
          if (!hasAriaLabel && element.children.length === 0) {
            const ariaLabelAttribute = t.jsxAttribute(
              t.jsxIdentifier('aria-label'),
              t.stringLiteral('Button')
            );
            element.openingElement.attributes.push(ariaLabelAttribute);
          }
        }
      }
    }
  });
}

function removeDuplicateFunctionsAST(ast: t.File): void {
  const functionNames = new Set<string>();
  const duplicates: any[] = [];
  
  traverse(ast, {
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (name) {
        if (functionNames.has(name)) {
          duplicates.push(path);
        } else {
          functionNames.add(name);
        }
      }
    }
  });
  
  duplicates.forEach(path => path.remove());
}
