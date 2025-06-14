
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ASTTransformer';

export async function transformAST(code: string): Promise<string> {
  // First try to fix HTML entities using string replacement before AST parsing
  const preProcessedCode = fixHTMLEntitiesString(code);
  
  const transformer = new ASTTransformer();
  
  try {
    return transformer.transform(preProcessedCode, (ast) => {
      fixHTMLEntitiesAST(ast);
    });
  } catch (error) {
    console.warn('AST transform failed for entities, using string replacement fallback');
    return preProcessedCode;
  }
}

function fixHTMLEntitiesString(code: string): string {
  let fixed = code;
  
  // Fix HTML entities that would break parsing
  fixed = fixed.replace(/&quot;/g, '"');
  fixed = fixed.replace(/&#x27;/g, "'");
  fixed = fixed.replace(/&#39;/g, "'");
  fixed = fixed.replace(/&amp;/g, '&');
  fixed = fixed.replace(/&lt;/g, '<');
  fixed = fixed.replace(/&gt;/g, '>');
  fixed = fixed.replace(/&nbsp;/g, ' ');
  fixed = fixed.replace(/&apos;/g, "'");
  fixed = fixed.replace(/&lsquo;/g, "'");
  fixed = fixed.replace(/&rsquo;/g, "'");
  fixed = fixed.replace(/&ldquo;/g, '"');
  fixed = fixed.replace(/&rdquo;/g, '"');
  
  return fixed;
}

function fixHTMLEntitiesAST(ast: t.File): void {
  traverse(ast, {
    StringLiteral(path) {
      let value = path.node.value;
      const originalValue = value;
      
      // Fix HTML entities in string literals
      value = value.replace(/&quot;/g, '"');
      value = value.replace(/&#x27;/g, "'");
      value = value.replace(/&#39;/g, "'");
      value = value.replace(/&amp;/g, '&');
      value = value.replace(/&lt;/g, '<');
      value = value.replace(/&gt;/g, '>');
      value = value.replace(/&nbsp;/g, ' ');
      value = value.replace(/&apos;/g, "'");
      value = value.replace(/&lsquo;/g, "'");
      value = value.replace(/&rsquo;/g, "'");
      value = value.replace(/&ldquo;/g, '"');
      value = value.replace(/&rdquo;/g, '"');
      
      if (value !== originalValue) {
        path.node.value = value;
      }
    },
    TemplateLiteral(path) {
      path.node.quasis.forEach(quasi => {
        let value = quasi.value.raw;
        const originalValue = value;
        
        // Fix HTML entities in template literals
        value = value.replace(/&quot;/g, '"');
        value = value.replace(/&#x27;/g, "'");
        value = value.replace(/&#39;/g, "'");
        value = value.replace(/&amp;/g, '&');
        value = value.replace(/&lt;/g, '<');
        value = value.replace(/&gt;/g, '>');
        value = value.replace(/&nbsp;/g, ' ');
        value = value.replace(/&apos;/g, "'");
        value = value.replace(/&lsquo;/g, "'");
        value = value.replace(/&rsquo;/g, "'");
        value = value.replace(/&ldquo;/g, '"');
        value = value.replace(/&rdquo;/g, '"');
        
        if (value !== originalValue) {
          quasi.value.raw = value;
          quasi.value.cooked = value;
        }
      });
    }
  });
}
