import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';
import { ASTUtils } from '../utils';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();
  
  try {
    return transformer.transform(code, (ast) => {
      fixUseClientDirectivesAST(ast);
      addMissingUseClientAST(ast, code);
      fixAppRouterPatternsAST(ast);
    });
  } catch (error) {
    console.warn('AST transform failed for layer-5-nextjs, using fallback');
    throw error;
  }
}

function fixUseClientDirectivesAST(ast: t.File): void {
  try {
    // Remove duplicate 'use client' directives, keep only one at the top
    const useClientDirectives = ast.program.directives.filter(
      d => d.value.value === 'use client'
    );
    
    if (useClientDirectives.length > 1) {
      // Remove all existing 'use client' directives
      ast.program.directives = ast.program.directives.filter(
        d => d.value.value !== 'use client'
      );
      
      // Add one at the beginning
      ast.program.directives.unshift(
        t.directive(t.directiveLiteral('use client'))
      );
    }
  } catch (error) {
    console.warn('Error fixing use client directives:', error);
  }
}

function addMissingUseClientAST(ast: t.File, code: string): void {
  try {
    const hasHooks = ASTUtils.hasReactHooks(ast);
    const hasUseClient = ASTUtils.hasUseClientDirective(code);
    const isComponent = hasComponentExport(ast);
    const hasEventHandlers = ASTUtils.hasEventHandlers(ast);
    const hasBrowserAPIs = ASTUtils.hasBrowserAPIs(code);
    
    if ((hasHooks || hasEventHandlers || hasBrowserAPIs) && !hasUseClient && isComponent) {
      ASTUtils.addUseClientDirective(ast);
    }
  } catch (error) {
    console.warn('Error adding missing use client:', error);
  }
}

function hasComponentExport(ast: t.File): boolean {
  try {
    let hasComponent = false;
    
    traverse(ast, {
      ExportDefaultDeclaration(path) {
        if (t.isFunctionDeclaration(path.node.declaration) || 
            t.isArrowFunctionExpression(path.node.declaration)) {
          hasComponent = true;
        }
      },
      ExportNamedDeclaration(path) {
        if (path.node.declaration && t.isFunctionDeclaration(path.node.declaration)) {
          hasComponent = true;
        }
      }
    });
    
    return hasComponent;
  } catch (error) {
    console.warn('Error checking for component export:', error);
    return false;
  }
}

function fixAppRouterPatternsAST(ast: t.File): void {
  try {
    traverse(ast, {
      ExportDefaultDeclaration(path) {
        if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
          const funcName = path.node.declaration.id.name;
          
          // Fix page.tsx exports
          if (funcName.toLowerCase().includes('page')) {
            path.node.declaration.id.name = 'Page';
          }
          
          // Fix layout.tsx exports  
          if (funcName.toLowerCase().includes('layout')) {
            path.node.declaration.id.name = 'Layout';
          }
        }
      }
    });
    
    // Add metadata export for pages if missing
    const hasPageExport = ast.program.body.some(stmt =>
      t.isExportDefaultDeclaration(stmt) &&
      t.isFunctionDeclaration(stmt.declaration) &&
      stmt.declaration.id?.name === 'Page'
    );
    
    const hasMetadataExport = ast.program.body.some(stmt =>
      t.isExportNamedDeclaration(stmt) &&
      stmt.specifiers?.some(spec =>
        t.isExportSpecifier(spec) && 
        t.isIdentifier(spec.exported) &&
        spec.exported.name === 'metadata'
      )
    );
    
    if (hasPageExport && !hasMetadataExport) {
      const metadataDeclaration = t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('metadata'),
          t.objectExpression([
            t.objectProperty(t.identifier('title'), t.stringLiteral('Page Title')),
            t.objectProperty(t.identifier('description'), t.stringLiteral('Page description'))
          ])
        )
      ]);
      
      const metadataExport = t.exportNamedDeclaration(metadataDeclaration);
      ast.program.body.unshift(metadataExport);
    }
  } catch (error) {
    console.warn('Error fixing App Router patterns:', error);
  }
}
