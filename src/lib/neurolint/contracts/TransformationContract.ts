
import * as t from '@babel/types';

export interface TransformationContract {
  name: string;
  preconditions: ValidationRule[];
  postconditions: ValidationRule[];
  rollback?: (code: string) => string;
  fingerprint?: (ast: t.File) => string;
}

export interface ValidationRule {
  name: string;
  check: (code: string, ast?: t.File) => boolean;
  errorMessage: string;
}

export interface ContractResult {
  passed: boolean;
  failedRules: string[];
  fingerprint?: string;
}

export class TransformationValidator {
  validatePreconditions(contract: TransformationContract, code: string, ast?: t.File): ContractResult {
    const failedRules: string[] = [];
    
    for (const rule of contract.preconditions) {
      try {
        if (!rule.check(code, ast)) {
          failedRules.push(`${rule.name}: ${rule.errorMessage}`);
        }
      } catch (error) {
        failedRules.push(`${rule.name}: Validation error - ${error}`);
      }
    }
    
    return {
      passed: failedRules.length === 0,
      failedRules,
      fingerprint: contract.fingerprint ? contract.fingerprint(ast!) : undefined
    };
  }
  
  validatePostconditions(contract: TransformationContract, originalCode: string, transformedCode: string, ast?: t.File): ContractResult {
    const failedRules: string[] = [];
    
    for (const rule of contract.postconditions) {
      try {
        if (!rule.check(transformedCode, ast)) {
          failedRules.push(`${rule.name}: ${rule.errorMessage}`);
        }
      } catch (error) {
        failedRules.push(`${rule.name}: Validation error - ${error}`);
      }
    }
    
    return {
      passed: failedRules.length === 0,
      failedRules,
      fingerprint: contract.fingerprint ? contract.fingerprint(ast!) : undefined
    };
  }
}
