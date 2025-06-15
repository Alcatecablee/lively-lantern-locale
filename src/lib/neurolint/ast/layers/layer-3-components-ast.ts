
import * as t from '@babel/types';
import { ASTTransformer } from '../ASTTransformer';
import { addMissingImportsAST } from './layer-3-components/missing-imports-ast';
import { fixMissingKeyPropsAST } from './layer-3-components/missing-keys-ast';
import { fixAccessibilityAttributesAST } from './layer-3-components/accessibility-ast';
import { addComponentInterfacesAST } from './layer-3-components/component-interfaces-ast';

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
