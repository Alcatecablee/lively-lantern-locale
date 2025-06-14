
import { transformAST as transformEntitiesAST } from './layers/layer-2-entities-ast';
import { transformAST as transformComponentsAST } from './layers/layer-3-components-ast';
import { transformAST as transformHydrationAST } from './layers/layer-4-hydration-ast';
import { transformAST as transformNextJSAST } from './layers/layer-5-nextjs-ast';
import { transformAST as transformTestingAST } from './layers/layer-6-testing-ast';
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
    case 'layer-2-entities':
      result = await contractOrchestrator.transformWithContract(
        code,
        contract,
        transformEntitiesAST
      );
      break;
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
    case 'layer-5-nextjs':
      result = await contractOrchestrator.transformWithContract(
        code,
        contract,
        transformNextJSAST
      );
      break;
    case 'layer-6-testing':
      result = await contractOrchestrator.transformWithContract(
        code,
        contract,
        transformTestingAST
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
