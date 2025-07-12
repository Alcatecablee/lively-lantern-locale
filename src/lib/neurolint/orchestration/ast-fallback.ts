
/**
 * AST Fallback Strategy
 * Provides fallback mechanisms when AST transformation fails
 */

import { transformWithAST } from '../ast/orchestrator';

export class ASTFallbackStrategy {
  static async transformWithFallback(
    code: string, 
    layerConfig: any, 
    options: any
  ): Promise<string> {
    
    // Try AST transformation first if supported
    if (layerConfig.supportsAST && options.useAST) {
      try {
        const astResult = await transformWithAST(code, `layer-${layerConfig.id}`);
        if (astResult.success && !astResult.usedFallback) {
          return astResult.code;
        }
      } catch (error) {
        console.warn(`AST transformation failed for layer ${layerConfig.id}, falling back to regex`);
      }
    }

    // Fallback to regex transformation
    if (layerConfig.regexTransform) {
      return await layerConfig.regexTransform(code);
    }

    // No transformation available
    return code;
  }
}
