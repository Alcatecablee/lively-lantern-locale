
import { transformAST as transformComponentsAST } from './layers/layer-3-components-ast';
import { transformAST as transformHydrationAST } from './layers/layer-4-hydration-ast';
import { transformAST as transformNextjsAST } from './layers/layer-5-nextjs-ast';

export interface ASTTransformResult {
  success: boolean;
  code: string;
  error?: string;
  usedFallback?: boolean;
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
      case 'layer-5-nextjs':
        transformed = await transformNextjsAST(code);
        break;
      default:
        return { 
          success: false, 
          code, 
          error: `Unknown layer: ${layerName}`,
          usedFallback: false 
        };
    }
    
    // Validate the transformed code is different and valid
    if (transformed === code) {
      console.log(`AST transform for ${layerName} made no changes`);
    }
    
    return { 
      success: true, 
      code: transformed,
      usedFallback: false
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`AST transform failed for ${layerName}:`, errorMessage);
    
    return { 
      success: false, 
      code, 
      error: errorMessage,
      usedFallback: true
    };
  }
}
