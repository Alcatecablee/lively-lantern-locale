
import { transformAST as transformComponentsAST } from './layers/layer-3-components-ast';
import { transformAST as transformHydrationAST } from './layers/layer-4-hydration-ast';

export interface ASTTransformResult {
  success: boolean;
  code: string;
  error?: string;
}

export async function transformWithAST(code: string, layerName: string): Promise<ASTTransformResult> {
  try {
    let transformed = code;
    
    switch (layerName) {
      case 'layer-3-components':
        transformed = await transformComponentsAST(code);
        break;
      case 'layer-4-hydration':
        transformed = await transformHydrationAST(code);
        break;
      default:
        return { success: false, code, error: `Unknown layer: ${layerName}` };
    }
    
    return { success: true, code: transformed };
  } catch (error) {
    return { 
      success: false, 
      code, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
