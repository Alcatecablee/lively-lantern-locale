import { NeuroLintEnhancedOrchestrator } from './orchestrator-enhanced';
import { NeuroLintLayerResult } from './types';

// Keep the original orchestrator as the default export for backward compatibility
// But now it uses the enhanced orchestrator under the hood
export async function NeuroLintOrchestrator(
  code: string, 
  filePath?: string, 
  useAST: boolean = true
): Promise<{
  transformed: string;
  layers: NeuroLintLayerResult[];
}> {
  const result = await NeuroLintEnhancedOrchestrator(code, filePath, useAST, false);
  return {
    transformed: result.transformed,
    layers: result.layers
  };
}

// Export the enhanced version for users who want Phase 2 features
export { NeuroLintEnhancedOrchestrator };
export type { NeuroLintLayerResult };
