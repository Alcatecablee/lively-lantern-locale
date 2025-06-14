
import { transform as transformEntities } from './layers/layer-2-entities';
import { transform as transformComponents } from './layers/layer-3-components';
import { transform as transformHydration } from './layers/layer-4-hydration';
import { transform as transformNextJS } from './layers/layer-5-nextjs';
import { transform as transformTesting } from './layers/layer-6-testing';
import { NeuroLintLayerResult } from './types';

// Enhanced orchestrator with better error handling and validation
export async function NeuroLintOrchestrator(
  code: string, 
  filePath?: string, 
  useAST: boolean = true
): Promise<{
  transformed: string;
  layers: NeuroLintLayerResult[];
}> {
  // Try to use enhanced orchestrator if available
  try {
    const { NeuroLintEnhancedOrchestrator } = await import('./orchestrator-enhanced');
    const result = await NeuroLintEnhancedOrchestrator(
      code, 
      filePath, 
      useAST, 
      true, // enableConflictDetection
      true  // enableSemanticAnalysis
    );
    return {
      transformed: result.transformed,
      layers: result.layers
    };
  } catch (error) {
    console.warn('Enhanced orchestrator not available, using basic version:', error);
    // Fall back to basic orchestrator
  }

  const layers: NeuroLintLayerResult[] = [];
  let currentCode = code;

  // Layer 2: HTML Entities
  try {
    const startTime = Date.now();
    const transformedCode = await transformEntities(currentCode);
    const executionTime = Date.now() - startTime;
    layers.push({
      name: 'layer-2-entities',
      success: true,
      code: transformedCode,
      originalSize: currentCode.length,
      transformedSize: transformedCode.length,
      executionTime
    });
    currentCode = transformedCode;
  } catch (error) {
    layers.push({
      name: 'layer-2-entities',
      success: false,
      code: currentCode,
      error: error instanceof Error ? error.message : 'Unknown error',
      originalSize: currentCode.length,
      transformedSize: currentCode.length,
      executionTime: 0
    });
  }

  // Layer 3: Components
  try {
    const startTime = Date.now();
    const transformedCode = await transformComponents(currentCode);
    const executionTime = Date.now() - startTime;
    layers.push({
      name: 'layer-3-components',
      success: true,
      code: transformedCode,
      originalSize: currentCode.length,
      transformedSize: transformedCode.length,
      executionTime
    });
    currentCode = transformedCode;
  } catch (error) {
    layers.push({
      name: 'layer-3-components',
      success: false,
      code: currentCode,
      error: error instanceof Error ? error.message : 'Unknown error',
      originalSize: currentCode.length,
      transformedSize: currentCode.length,
      executionTime: 0
    });
  }

  // Layer 4: Hydration
  try {
    const startTime = Date.now();
    const transformedCode = await transformHydration(currentCode);
    const executionTime = Date.now() - startTime;
    layers.push({
      name: 'layer-4-hydration',
      success: true,
      code: transformedCode,
      originalSize: currentCode.length,
      transformedSize: transformedCode.length,
      executionTime
    });
    currentCode = transformedCode;
  } catch (error) {
    layers.push({
      name: 'layer-4-hydration',
      success: false,
      code: currentCode,
      error: error instanceof Error ? error.message : 'Unknown error',
      originalSize: currentCode.length,
      transformedSize: currentCode.length,
      executionTime: 0
    });
  }

  // Layer 5: Next.js
  try {
    const startTime = Date.now();
    const transformedCode = await transformNextJS(currentCode);
    const executionTime = Date.now() - startTime;
    layers.push({
      name: 'layer-5-nextjs',
      success: true,
      code: transformedCode,
      originalSize: currentCode.length,
      transformedSize: transformedCode.length,
      executionTime
    });
    currentCode = transformedCode;
  } catch (error) {
    layers.push({
      name: 'layer-5-nextjs',
      success: false,
      code: currentCode,
      error: error instanceof Error ? error.message : 'Unknown error',
      originalSize: currentCode.length,
      transformedSize: currentCode.length,
      executionTime: 0
    });
  }

  // Layer 6: Testing
  try {
    const startTime = Date.now();
    const transformedCode = await transformTesting(currentCode);
    const executionTime = Date.now() - startTime;
    layers.push({
      name: 'layer-6-testing',
      success: true,
      code: transformedCode,
      originalSize: currentCode.length,
      transformedSize: transformedCode.length,
      executionTime
    });
    currentCode = transformedCode;
  } catch (error) {
    layers.push({
      name: 'layer-6-testing',
      success: false,
      code: currentCode,
      error: error instanceof Error ? error.message : 'Unknown error',
      originalSize: currentCode.length,
      transformedSize: currentCode.length,
      executionTime: 0
    });
  }

  return {
    transformed: currentCode,
    layers
  };
}

// Export the enhanced version for users who want Phase 2 features
export { NeuroLintEnhancedOrchestrator } from './orchestrator-enhanced';
export type { NeuroLintLayerResult };
