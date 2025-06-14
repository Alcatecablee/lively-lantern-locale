
import { TransformationContract, TransformationValidator, ContractResult } from './TransformationContract';
import { QualityGates } from './QualityGates';
import { ASTTransformer } from '../ast/ASTTransformer';
import { componentsContract } from './ComponentsContract';
import { hydrationContract } from './HydrationContract';

export interface ContractedTransformResult {
  success: boolean;
  code: string;
  error?: string;
  contractResults: {
    preconditions: ContractResult;
    postconditions: ContractResult;
  };
  performanceImpact?: {
    sizeIncrease: number;
    complexityIncrease: number;
    impact: 'low' | 'medium' | 'high';
  };
  fingerprint?: string;
}

export class ContractOrchestrator {
  private validator = new TransformationValidator();
  private transformer = new ASTTransformer();

  async transformWithContract(
    code: string,
    contract: TransformationContract,
    transformFn: (code: string) => Promise<string> | string
  ): Promise<ContractedTransformResult> {
    const startTime = Date.now();
    
    try {
      // Parse AST for validation
      const ast = this.transformer.parse(code);
      
      // Validate preconditions
      const preconditions = this.validator.validatePreconditions(contract, code, ast || undefined);
      
      if (!preconditions.passed) {
        console.warn(`Preconditions failed for ${contract.name}:`, preconditions.failedRules);
        return {
          success: false,
          code,
          error: `Preconditions failed: ${preconditions.failedRules.join(', ')}`,
          contractResults: {
            preconditions,
            postconditions: { passed: false, failedRules: ['Not executed due to precondition failure'] }
          }
        };
      }

      // Store original fingerprint to detect if processing is needed
      const originalFingerprint = preconditions.fingerprint;
      
      // Apply transformation
      const transformedCode = await transformFn(code);
      
      // Validate syntax immediately after transformation
      const syntaxCheck = QualityGates.validateSyntax(transformedCode);
      if (!syntaxCheck.valid) {
        console.warn(`Syntax validation failed for ${contract.name}:`, syntaxCheck.error);
        
        // Attempt rollback if available
        if (contract.rollback) {
          const rolledBackCode = contract.rollback(code);
          const rollbackSyntaxCheck = QualityGates.validateSyntax(rolledBackCode);
          
          if (rollbackSyntaxCheck.valid) {
            return {
              success: true,
              code: rolledBackCode,
              error: `Transformation failed, rollback applied: ${syntaxCheck.error}`,
              contractResults: {
                preconditions,
                postconditions: { passed: false, failedRules: ['Applied rollback due to syntax error'] }
              }
            };
          }
        }
        
        // If rollback failed or not available, return original code
        return {
          success: false,
          code,
          error: `Transformation produced invalid syntax: ${syntaxCheck.error}`,
          contractResults: {
            preconditions,
            postconditions: { passed: false, failedRules: [`Syntax error: ${syntaxCheck.error}`] }
          }
        };
      }

      // Parse transformed AST for post-validation
      const transformedAst = this.transformer.parse(transformedCode);
      
      // Validate postconditions
      const postconditions = this.validator.validatePostconditions(
        contract, 
        code, 
        transformedCode, 
        transformedAst || undefined
      );
      
      if (!postconditions.passed) {
        console.warn(`Postconditions failed for ${contract.name}:`, postconditions.failedRules);
        
        // Attempt rollback
        if (contract.rollback) {
          const rolledBackCode = contract.rollback(code);
          return {
            success: true,
            code: rolledBackCode,
            error: `Postconditions failed, rollback applied: ${postconditions.failedRules.join(', ')}`,
            contractResults: {
              preconditions,
              postconditions: { passed: false, failedRules: ['Applied rollback due to postcondition failure'] }
            }
          };
        }
        
        return {
          success: false,
          code,
          error: `Postconditions failed: ${postconditions.failedRules.join(', ')}`,
          contractResults: {
            preconditions,
            postconditions
          }
        };
      }

      // Measure performance impact
      const performanceImpact = QualityGates.measurePerformanceImpact(code, transformedCode);
      
      const executionTime = Date.now() - startTime;
      console.log(`Contract validation for ${contract.name} completed in ${executionTime}ms`);

      return {
        success: true,
        code: transformedCode,
        contractResults: {
          preconditions,
          postconditions
        },
        performanceImpact,
        fingerprint: postconditions.fingerprint
      };

    } catch (error) {
      return {
        success: false,
        code,
        error: error instanceof Error ? error.message : 'Unknown error during contract validation',
        contractResults: {
          preconditions: { passed: false, failedRules: ['Exception during execution'] },
          postconditions: { passed: false, failedRules: ['Exception during execution'] }
        }
      };
    }
  }

  getContractForLayer(layerName: string): TransformationContract | null {
    switch (layerName) {
      case 'layer-3-components':
        return componentsContract;
      case 'layer-4-hydration':
        return hydrationContract;
      default:
        return null;
    }
  }
}
