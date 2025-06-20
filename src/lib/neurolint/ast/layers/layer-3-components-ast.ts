
import * as t from '@babel/types';
import { ASTTransformer } from '../ASTTransformer';
import { addMissingImportsAST } from '../components/imports';
import { fixMissingKeyPropsAST } from '../components/keys';
import { fixAccessibilityAttributesAST } from '../components/accessibility';
import { addComponentInterfacesAST } from '../components/interfaces';

export async function transformAST(code: string): Promise<string> {
  const transformer = new ASTTransformer();
  
  try {
    return transformer.transform(code, (ast) => {
      addMissingImportsAST(ast);
      fixMissingKeyPropsAST(ast);
      fixAccessibilityAttributesAST(ast);
      addComponentInterfacesAST(ast);
    });
  } catch (error) {
    console.warn('AST transform failed for layer-3-components, using fallback');
    throw error;
  }
}
