
import { transformWithAST } from './ast/orchestrator';
import MasterOrchestrator from './layers/fix-master';

export interface ASTTransformResult {
  success: boolean;
  code: string;
  error?: string;
  usedFallback?: boolean;
}

export interface LayerOutput {
  id: number;
  name: string;
  success: boolean;
  code: string;
  executionTime: number;
  changeCount?: number;
  improvements?: string[];
  error?: string;
  errorCategory?: string;
  suggestion?: string;
  recoveryOptions?: string[];
  revertReason?: string;
  layerId?: number;
  reverted?: boolean;
  description?: string;
  message?: string;
}

export interface NeuroLintLayerResult extends LayerOutput {}

export interface TransformationResult {
  success: boolean;
  transformed: string;
  layers: LayerOutput[];
  executionTime: number;
  error?: string;
  executionStats?: any;
  diagnostics?: any;
  layerOutputs?: string[];
  backup?: string;
}

export const LAYER_LIST = [
  { id: 1, name: 'Configuration', description: 'Foundation setup and TypeScript/Next.js config optimization' },
  { id: 2, name: 'Entity Cleanup', description: 'HTML entities and pattern modernization' },
  { id: 3, name: 'Components', description: 'React component fixes and best practices' },
  { id: 4, name: 'Hydration', description: 'SSR safety and hydration issue resolution' },
  { id: 5, name: 'Next.js', description: 'App Router and Next.js specific optimizations' },
  { id: 6, name: 'Testing', description: 'Testing patterns and validation improvements' }
];

export async function NeuroLintOrchestrator(
  code: string,
  filePath?: string,
  dryRun: boolean = false,
  selectedLayers?: number[]
): Promise<TransformationResult> {
  const startTime = performance.now();
  
  try {
    // Use your sophisticated MasterOrchestrator
    const orchestrator = new MasterOrchestrator({
      verbose: true,
      failFast: false,
      validateEach: true,
      generateReport: true,
      dryRun
    });

    const result = await orchestrator.executeAllLayers();
    
    const layerOutputs: LayerOutput[] = result.layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      success: layer.success,
      code: code, // The transformed code would be handled by your system
      executionTime: layer.executionTime,
      changeCount: layer.changes,
      error: layer.errors.length > 0 ? layer.errors[0] : undefined,
      description: LAYER_LIST.find(l => l.id === layer.id)?.description || ''
    }));

    const totalExecutionTime = performance.now() - startTime;
    const successfulLayers = layerOutputs.filter(layer => layer.success).length;

    return {
      success: successfulLayers > 0,
      transformed: code, // Your system handles the actual transformation
      layers: layerOutputs,
      executionTime: totalExecutionTime,
      executionStats: {
        totalLayers: result.layers.length,
        successfulLayers,
        failedLayers: result.layers.length - successfulLayers,
        totalExecutionTime,
        totalChanges: result.totalChanges
      },
      backup: code
    };

  } catch (error) {
    console.error('❌ Orchestration failed:', error);
    
    return {
      success: false,
      transformed: code,
      layers: [],
      executionTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown orchestration error'
    };
  }
}
