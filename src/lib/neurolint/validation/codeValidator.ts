
import * as parser from '@babel/parser';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  corruptionDetected: boolean;
}

export class CodeValidator {
  static validate(code: string): ValidationResult {
    const errors: string[] = [];
    let isValid = true;
    let corruptionDetected = false;

    try {
      // Try to parse the code to check for syntax errors
      parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        strictMode: false,
      });
    } catch (error) {
      isValid = false;
      errors.push(`Syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check for common corruption patterns
    const corruptionPatterns = [
      // Corrupted onClick handlers
      /onClick=\{[^}]*\([^)]*\)\s*=>\s*\(\)\s*=>/g,
      // Double function calls
      /\(\)\s*=>[^}]*\([^)]*\)\([^)]*\)/g,
      // Malformed event handlers
      /onClick=\{[^}]*\)\([^)]*\)$/g,
      // Invalid JSX attributes
      /\w+=\{[^}]*\)[^}]*\}/g,
    ];

    for (const pattern of corruptionPatterns) {
      if (pattern.test(code)) {
        corruptionDetected = true;
        errors.push(`Corruption detected: ${pattern.source}`);
        break;
      }
    }

    return {
      isValid: isValid && !corruptionDetected,
      errors,
      corruptionDetected
    };
  }

  static compareBeforeAfter(before: string, after: string): {
    shouldRevert: boolean;
    reason?: string;
  } {
    const beforeValid = this.validate(before);
    const afterValid = this.validate(after);

    // If the original code was valid but transformed code is invalid, revert
    if (beforeValid.isValid && !afterValid.isValid) {
      return {
        shouldRevert: true,
        reason: `Transformation corrupted code: ${afterValid.errors.join(', ')}`
      };
    }

    // If corruption was introduced, revert
    if (!beforeValid.corruptionDetected && afterValid.corruptionDetected) {
      return {
        shouldRevert: true,
        reason: 'Transformation introduced corruption patterns'
      };
    }

    return { shouldRevert: false };
  }
}
