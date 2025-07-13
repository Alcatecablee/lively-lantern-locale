
import { transformWithAST } from './ast/orchestrator';

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
    // Browser-compatible orchestrator implementation
    const layersToProcess = selectedLayers || [1, 2, 3, 4, 5, 6];
    const layerOutputs: LayerOutput[] = [];
    let transformedCode = code;
    
    for (const layerId of layersToProcess) {
      const layerStartTime = performance.now();
      const layer = LAYER_LIST.find(l => l.id === layerId);
      
      if (!layer) continue;
      
      try {
        // Use AST transformations where available
        const astResult = await transformWithAST(transformedCode, `layer-${layerId}`);
        
        if (astResult.success) {
          transformedCode = astResult.code;
        }
        
        const executionTime = performance.now() - layerStartTime;
        
        layerOutputs.push({
          id: layerId,
          name: layer.name,
          success: astResult.success,
          code: transformedCode,
          executionTime,
          changeCount: transformedCode !== code ? 1 : 0,
          description: layer.description,
          error: astResult.error
        });
        
      } catch (error) {
        const executionTime = performance.now() - layerStartTime;
        
        layerOutputs.push({
          id: layerId,
          name: layer.name,
          success: false,
          code: transformedCode,
          executionTime,
          changeCount: 0,
          description: layer.description,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const totalExecutionTime = performance.now() - startTime;
    const successfulLayers = layerOutputs.filter(layer => layer.success).length;

    return {
      success: successfulLayers > 0,
      transformed: transformedCode,
      layers: layerOutputs,
      executionTime: totalExecutionTime,
      executionStats: {
        totalLayers: layerOutputs.length,
        successfulLayers,
        failedLayers: layerOutputs.length - successfulLayers,
        totalExecutionTime,
        totalChanges: transformedCode !== code ? 1 : 0
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
