
import { transformAST as transformEntitiesAST } from './layers/layer-2-entities-ast';
import { transformAST as transformComponentsAST } from './layers/layer-3-components-ast';
import { transformAST as transformHydrationAST } from './layers/layer-4-hydration-ast';
import { transformAST as transformNextJSAST } from './layers/layer-5-nextjs-ast';
import { transformAST as transformTestingAST } from './layers/layer-6-testing-ast';

export interface ASTTransformResult {
  success: boolean;
  code: string;
  error?: string;
}

export async function transformWithAST(code: string, layerName: string): Promise<ASTTransformResult> {
  try {
    let transformed = code;
    
    console.log(`Starting AST transformation for ${layerName}`);
    
    switch (layerName) {
      case 'layer-2-entities':
        transformed = await transformEntitiesAST(code);
        break;
      case 'layer-3-components':
        transformed = await transformComponentsAST(code);
        break;
      case 'layer-4-hydration':
        transformed = await transformHydrationAST(code);
        break;
      case 'layer-5-nextjs':
        transformed = await transformNextJSAST(code);
        break;
      case 'layer-6-testing':
        transformed = await transformTestingAST(code);
        break;
      default:
        console.warn(`Unknown layer: ${layerName}`);
        return { success: false, code, error: `Unknown layer: ${layerName}` };
    }
    
    console.log(`AST transformation completed for ${layerName}`);
    return { success: true, code: transformed };
    
  } catch (error) {
    console.error(`AST transformation failed for ${layerName}:`, error);
    return { 
      success: false, 
      code, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
