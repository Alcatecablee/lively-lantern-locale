
import { transformAST as transformComponentsAST } from './layers/layer-3-components-ast';
import { transformAST as transformHydrationAST } from './layers/layer-4-hydration-ast';
import { ContractOrchestrator, ContractedTransformResult } from '../contracts/ContractOrchestrator';

export interface ASTTransformResult {
  success: boolean;
  code: string;
  error?: string;
  contractResults?: {
    preconditions: { passed: boolean; failedRules: string[] };
    postconditions: { passed: boolean; failedRules: string[] };
  };
  performanceImpact?: {
    sizeIncrease: number;
    complexityIncrease: number;
    impact: 'low' | 'medium' | 'high';
  };
}

export async function transformWithAST(code: string, layerName: string): Promise<ASTTransformResult> {
  const contractOrchestrator = new ContractOrchestrator();
  const contract = contractOrchestrator.getContractForLayer(layerName);
  
  if (!contract) {
    // Fallback to original transformation without contracts
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

  // Use contract-based transformation
  let result: ContractedTransformResult;
  
  switch (layerName) {
    case 'layer-3-components':
      result = await contractOrchestrator.transformWithContract(
        code,
        contract,
        transformComponentsAST
      );
      break;
    case 'layer-4-hydration':
      result = await contractOrchestrator.transformWithContract(
        code,
        contract,
        transformHydrationAST
      );
      break;
    default:
      return { success: false, code, error: `Unknown layer: ${layerName}` };
  }

  return {
    success: result.success,
    code: result.code,
    error: result.error,
    contractResults: result.contractResults,
    performanceImpact: result.performanceImpact
  };
}
