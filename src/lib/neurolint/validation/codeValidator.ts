import * as parser from "@babel/parser";
import { ValidationReport } from "../types";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  corruptionDetected: boolean;
  complexity?: {
    cyclomaticComplexity: number;
    linesOfCode: number;
    functionCount: number;
  };
}

export class CodeValidator {
  static validate(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isValid = true;
    let corruptionDetected = false;
    let ast: any = null;

    try {
      // Try to parse the code to check for syntax errors
      ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx", "decorators-legacy"],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        strictMode: false,
        errorRecovery: true,
      });
    } catch (error) {
      isValid = false;
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Syntax error: ${errorMsg}`);
    }

    // Enhanced corruption pattern detection
    const corruptionResults = this.detectCorruption(code);
    corruptionDetected = corruptionResults.detected;
    errors.push(...corruptionResults.errors);
    warnings.push(...corruptionResults.warnings);

    // Calculate complexity metrics if AST is available
    let complexity: ValidationResult["complexity"];
    if (ast) {
      complexity = this.calculateComplexity(ast, code);
    }

    return {
      isValid: isValid && !corruptionDetected,
      errors,
      warnings,
      corruptionDetected,
      complexity,
    };
  }

  static validateComprehensive(code: string): ValidationReport {
    const result = this.validate(code);

    return {
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
      corruptionDetected: result.corruptionDetected,
      complexity: result.complexity || {
        cyclomaticComplexity: 0,
        linesOfCode: code.split("\n").length,
        functionCount: 0,
      },
    };
  }

  static compareBeforeAfter(
    before: string,
    after: string,
  ): {
    shouldRevert: boolean;
    reason?: string;
    severity?: "low" | "medium" | "high";
  } {
    const beforeValid = this.validate(before);
    const afterValid = this.validate(after);

    // Critical: If transformation broke valid code
    if (beforeValid.isValid && !afterValid.isValid) {
      return {
        shouldRevert: true,
        reason: `Transformation corrupted valid code: ${afterValid.errors.join(", ")}`,
        severity: "high",
      };
    }

    // Critical: If corruption was introduced
    if (!beforeValid.corruptionDetected && afterValid.corruptionDetected) {
      return {
        shouldRevert: true,
        reason: "Transformation introduced corruption patterns",
        severity: "high",
      };
    }

    // Medium: If errors increased significantly
    if (afterValid.errors.length > beforeValid.errors.length + 2) {
      return {
        shouldRevert: true,
        reason: `Transformation introduced multiple new errors (${afterValid.errors.length - beforeValid.errors.length})`,
        severity: "medium",
      };
    }

    // Check for complexity explosion
    if (beforeValid.complexity && afterValid.complexity) {
      const complexityIncrease =
        afterValid.complexity.cyclomaticComplexity -
        beforeValid.complexity.cyclomaticComplexity;
      if (complexityIncrease > 10) {
        return {
          shouldRevert: true,
          reason: `Transformation dramatically increased complexity (+${complexityIncrease})`,
          severity: "medium",
        };
      }
    }

    return { shouldRevert: false };
  }

  private static detectCorruption(code: string): {
    detected: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let detected = false;

    // Enhanced corruption patterns with more specific detection
    const corruptionPatterns = [
      // Corrupted onClick handlers
      {
        pattern: /onClick=\{[^}]*\([^)]*\)\s*=>\s*\(\)\s*=>/g,
        error: "Corrupted onClick handler with double arrow functions",
        severity: "error",
      },
      // Double function calls
      {
        pattern: /\(\)\s*=>[^}]*\([^)]*\)\([^)]*\)/g,
        error: "Double function call pattern detected",
        severity: "error",
      },
      // Malformed event handlers
      {
        pattern: /onClick=\{[^}]*\)\([^)]*\)$/g,
        error: "Malformed event handler syntax",
        severity: "error",
      },
      // Invalid JSX attributes
      {
        pattern: /\w+=\{[^}]*\)[^}]*\}/g,
        error: "Invalid JSX attribute structure",
        severity: "error",
      },
      // Unclosed JSX tags
      {
        pattern: /<(\w+)(?:\s[^>]*)?(?!\/?>)$/gm,
        error: "Potentially unclosed JSX tag",
        severity: "warning",
      },
      // Malformed imports
      {
        pattern: /import\s+\{[^}]*\s+from\s+[^'"]*$/gm,
        error: "Malformed import statement",
        severity: "error",
      },
      // Incomplete function definitions
      {
        pattern: /function\s+\w+\s*\([^)]*\)\s*\{[^}]*$/gm,
        error: "Incomplete function definition",
        severity: "warning",
      },
    ];

    for (const { pattern, error, severity } of corruptionPatterns) {
      if (pattern.test(code)) {
        detected = true;
        if (severity === "error") {
          errors.push(error);
        } else {
          warnings.push(error);
        }
      }
    }

    // Check for balanced brackets
    const bracketBalance = this.checkBracketBalance(code);
    if (!bracketBalance.balanced) {
      detected = true;
      errors.push(`Unbalanced brackets: ${bracketBalance.details}`);
    }

    return { detected, errors, warnings };
  }

  private static checkBracketBalance(code: string): {
    balanced: boolean;
    details: string;
  } {
    const stack: string[] = [];
    const pairs: { [key: string]: string } = {
      "(": ")",
      "[": "]",
      "{": "}",
    };
    const opening = Object.keys(pairs);
    const closing = Object.values(pairs);

    for (let i = 0; i < code.length; i++) {
      const char = code[i];

      if (opening.includes(char)) {
        stack.push(char);
      } else if (closing.includes(char)) {
        const last = stack.pop();
        if (!last || pairs[last] !== char) {
          return {
            balanced: false,
            details: `Mismatched ${char} at position ${i}`,
          };
        }
      }
    }

    if (stack.length > 0) {
      return {
        balanced: false,
        details: `Unclosed ${stack[stack.length - 1]} brackets`,
      };
    }

    return { balanced: true, details: "" };
  }

  private static calculateComplexity(
    ast: any,
    code: string,
  ): {
    cyclomaticComplexity: number;
    linesOfCode: number;
    functionCount: number;
  } {
    // Simple complexity calculation
    let cyclomaticComplexity = 1; // Base complexity
    let functionCount = 0;
    const linesOfCode = code
      .split("\n")
      .filter((line) => line.trim().length > 0).length;

    // Count decision points and functions (simplified)
    const wordBoundaryKeywords = [
      "if",
      "else",
      "while",
      "for",
      "switch",
      "case",
      "catch",
    ];
    const operatorKeywords = ["&&", "||", "?"];
    const functionKeywords = ["function", "=>", "function*"];

    // Count word-boundary keywords (safe for \b usage)
    for (const keyword of wordBoundaryKeywords) {
      const matches = code.match(new RegExp(`\\b${keyword}\\b`, "g")) || [];
      cyclomaticComplexity += matches.length;
    }

    // Count operator keywords (escape special characters, no word boundaries)
    for (const keyword of operatorKeywords) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matches = code.match(new RegExp(escapedKeyword, "g")) || [];
      cyclomaticComplexity += matches.length;
    }

    // Count function keywords (escape special characters)
    for (const keyword of functionKeywords) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matches = code.match(new RegExp(escapedKeyword, "g")) || [];
      functionCount += matches.length;
    }

    return {
      cyclomaticComplexity,
      linesOfCode,
      functionCount,
    };
  }

  // Safety check for specific layer transformations
  static validateLayerSafety(
    layerId: number,
    before: string,
    after: string,
  ): {
    safe: boolean;
    warnings: string[];
    blockers: string[];
  } {
    const warnings: string[] = [];
    const blockers: string[] = [];

    switch (layerId) {
      case 1: // Config layer
        // Config files should maintain valid JSON/JS structure
        if (before.includes("{") && !after.includes("{")) {
          blockers.push("Config structure was corrupted");
        }
        break;

      case 2: // Pattern layer
        // Should not break import statements
        const beforeImports = (before.match(/import.*from/g) || []).length;
        const afterImports = (after.match(/import.*from/g) || []).length;
        if (afterImports < beforeImports) {
          warnings.push("Import statements were modified");
        }
        break;

      case 3: // Component layer
        // Should not break JSX structure
        const beforeJsxTags = (before.match(/<[^>]+>/g) || []).length;
        const afterJsxTags = (after.match(/<[^>]+>/g) || []).length;
        if (Math.abs(afterJsxTags - beforeJsxTags) > beforeJsxTags * 0.2) {
          warnings.push("Significant JSX structure changes detected");
        }
        break;

      case 4: // Hydration layer
        // Should not break existing useEffect hooks
        const beforeEffects = (before.match(/useEffect/g) || []).length;
        const afterEffects = (after.match(/useEffect/g) || []).length;
        if (afterEffects < beforeEffects) {
          blockers.push("useEffect hooks were removed");
        }
        break;
    }

    return {
      safe: blockers.length === 0,
      warnings,
      blockers,
    };
  }
}
