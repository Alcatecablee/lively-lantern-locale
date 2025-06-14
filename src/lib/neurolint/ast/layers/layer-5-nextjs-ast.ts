
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';
import { ASTUtils } from '../utils';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();
  
  try {
    return transformer.transform(code, (ast) => {
      addUseClientDirectiveAST(ast, code);
      cleanImportsAST(ast);
    });
  } catch (error) {
    console.warn('AST transform failed for Next.js layer');
    throw error;
  }
}

function addUseClientDirectiveAST(ast: t.File, code: string): void {
  if (ASTUtils.needsUseClient(ast, code) && !ASTUtils.hasUseClientDirective(code)) {
    ASTUtils.addUseClientDirective(ast);
  }
}

function cleanImportsAST(ast: t.File): void {
  const imports = new Map<string, t.ImportDeclaration>();
  const duplicateImports: t.ImportDeclaration[] = [];
  
  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      const importKey = `${source}-${path.node.specifiers.map(spec => {
        if (t.isImportDefaultSpecifier(spec)) return `default:${spec.local.name}`;
        if (t.isImportNamespaceSpecifier(spec)) return `namespace:${spec.local.name}`;
        if (t.isImportSpecifier(spec)) {
          const imported = t.isIdentifier(spec.imported) ? spec.imported.name : spec.imported.value;
          return `named:${imported}:${spec.local.name}`;
        }
        return '';
      }).join(',')}`;
      
      if (imports.has(importKey)) {
        duplicateImports.push(path.node);
        path.remove();
      } else {
        imports.set(importKey, path.node);
      }
    }
  });
  
  if (duplicateImports.length > 0) {
    console.log(`Removed ${duplicateImports.length} duplicate imports`);
  }
}
