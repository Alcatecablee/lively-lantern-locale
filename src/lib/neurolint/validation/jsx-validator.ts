
import * as parser from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';

export interface JSXValidationResult {
  isValid: boolean;
  errors: string[];
  hasJSX: boolean;
  syntaxValid: boolean;
}

export function validateJSXIntegrity(originalCode: string, transformedCode: string): JSXValidationResult {
  const result: JSXValidationResult = {
    isValid: true,
    errors: [],
    hasJSX: false,
    syntaxValid: true
  };

  try {
    // Check if original had JSX
    const originalHasJSX = hasJSXElements(originalCode);
    const transformedHasJSX = hasJSXElements(transformedCode);
    
    result.hasJSX = originalHasJSX;

    // If original had JSX, transformed should too
    if (originalHasJSX && !transformedHasJSX) {
      result.isValid = false;
      result.errors.push('JSX elements were removed during transformation');
    }

    // Check for specific JSX corruption patterns (more precise)
    const corruptionPatterns = [
      /onClick=\{[^}]*\)\s*=>\s*\(\)\s*=>/g, // Malformed onClick handlers like () => func()(e)
      /return\s*"[^"]*className[^"]*"[^;]*;/g, // JSX completely turned into return strings
      />\s*"[^"]*<\/\w+>/g, // JSX content turned into quoted strings
      /<\w+[^>]*"[^>]*>/g, // Unclosed quotes in JSX attributes
    ];

    for (const pattern of corruptionPatterns) {
      if (pattern.test(transformedCode)) {
        result.isValid = false;
        result.errors.push(`Detected JSX corruption pattern: ${pattern.source}`);
      }
    }

    // Try to parse the transformed code
    try {
      parser.parse(transformedCode, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        allowImportExportEverywhere: true,
        strictMode: false,
      });
    } catch (parseError) {
      result.syntaxValid = false;
      result.isValid = false;
      result.errors.push(`Syntax error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
  }

  return result;
}

function hasJSXElements(code: string): boolean {
  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      allowImportExportEverywhere: true,
      strictMode: false,
    });

    let hasJSX = false;
    traverse(ast, {
      JSXElement() {
        hasJSX = true;
      },
      JSXFragment() {
        hasJSX = true;
      }
    });

    return hasJSX;
  } catch (error) {
    // If we can't parse, assume it might have JSX based on patterns
    return /<[A-Za-z][^>]*>/.test(code);
  }
}

export function createJSXRoundTripTest(inputJSX: string): { success: boolean; error?: string } {
  try {
    // Parse the JSX
    const ast = parser.parse(inputJSX, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      allowImportExportEverywhere: true,
      strictMode: false,
    });

    // Generate back to code
    const generate = require('@babel/generator').default;
    const output = generate(ast, {
      retainLines: false,
      compact: false,
      comments: true,
    });

    // Check if we can parse the output again
    parser.parse(output.code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      allowImportExportEverywhere: true,
      strictMode: false,
    });

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown round-trip error'
    };
  }
}
