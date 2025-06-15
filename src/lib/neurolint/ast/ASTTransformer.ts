
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export interface ASTTransformOptions {
  preserveComments?: boolean;
  plugins?: string[];
}

export class ASTTransformer {
  private options: ASTTransformOptions;

  constructor(options: ASTTransformOptions = {}) {
    this.options = {
      preserveComments: true,
      plugins: [
        'typescript',
        'jsx',
        'decorators-legacy',
        'classProperties',
        'objectRestSpread',
        'functionBind',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'dynamicImport',
        'nullishCoalescingOperator',
        'optionalChaining',
        'importMeta',
        'topLevelAwait',
        'optionalCatchBinding'
      ],
      ...options
    };
  }

  parse(code: string) {
    try {
      // Clean the code before parsing
      const cleanedCode = this.preprocessCode(code);
      
      return parser.parse(cleanedCode, {
        sourceType: 'module',
        plugins: this.options.plugins as any[],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
        allowUndeclaredExports: true,
        strictMode: false,
        ranges: false,
        tokens: false,
      });
    } catch (error) {
      console.warn('AST parsing failed, trying with minimal plugins:', error);
      
      // Fallback with minimal plugins
      try {
        const cleanedCode = this.preprocessCode(code);
        return parser.parse(cleanedCode, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
          allowImportExportEverywhere: true,
          allowReturnOutsideFunction: true,
          strictMode: false,
        });
      } catch (fallbackError) {
        console.warn('AST parsing completely failed:', fallbackError);
        return null;
      }
    }
  }

  private preprocessCode(code: string): string {
    let cleaned = code;
    
    // Remove potential BOM
    cleaned = cleaned.replace(/^\uFEFF/, '');
    
    // Fix common syntax issues that break parsing
    cleaned = cleaned.replace(/&quot;/g, '"');
    cleaned = cleaned.replace(/&amp;/g, '&');
    cleaned = cleaned.replace(/&lt;/g, '<');
    cleaned = cleaned.replace(/&gt;/g, '>');
    
    // Fix malformed imports
    cleaned = cleaned.replace(/import\s*{\s*\n\s*import\s*{/g, 'import {');
    
    // IMPROVED: Remove duplicate imports that cause parsing errors
    cleaned = this.removeDuplicateImports(cleaned);
    
    // Ensure proper line endings
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    return cleaned;
  }

  private removeDuplicateImports(code: string): string {
    const lines = code.split('\n');
    const seenImports = new Set<string>();
    const result: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ')) {
        // Normalize the import line for comparison
        const normalized = trimmed.replace(/\s+/g, ' ');
        if (!seenImports.has(normalized)) {
          seenImports.add(normalized);
          result.push(line);
        }
        // Skip duplicate imports
      } else {
        result.push(line);
      }
    }
    
    return result.join('\n');
  }

  generate(ast: t.Node): string {
    try {
      const result = generate(ast, {
        retainLines: false,
        compact: false,
        comments: this.options.preserveComments,
        minified: false,
        concise: false,
      });
      return result.code;
    } catch (error) {
      console.warn('AST generation failed:', error);
      throw error;
    }
  }

  transform(code: string, transformFn: (ast: t.File) => void): string {
    const ast = this.parse(code);
    if (!ast) {
      throw new Error('Failed to parse code');
    }

    try {
      transformFn(ast);
      return this.generate(ast);
    } catch (error) {
      console.warn('AST transformation failed:', error);
      throw error;
    }
  }

  traverse(ast: t.Node, visitor: traverse.Visitor) {
    try {
      traverse(ast, visitor);
    } catch (error) {
      console.warn('AST traversal failed:', error);
      throw error;
    }
  }
}
