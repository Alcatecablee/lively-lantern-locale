
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
      plugins: ['typescript', 'jsx'],
      ...options
    };
  }

  parse(code: string) {
    try {
      return parser.parse(code, {
        sourceType: 'module',
        plugins: this.options.plugins as any[],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
      });
    } catch (error) {
      console.warn('AST parsing failed, falling back to string transforms:', error);
      return null;
    }
  }

  generate(ast: t.Node): string {
    try {
      const result = generate(ast, {
        retainLines: false,
        compact: false,
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

    transformFn(ast);
    return this.generate(ast);
  }

  traverse(ast: t.Node, visitor: traverse.Visitor) {
    traverse(ast, visitor);
  }
}
