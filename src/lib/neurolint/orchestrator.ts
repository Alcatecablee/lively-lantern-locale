
import { transform as transformEntities } from './layers/layer-2-entities';
import { transform as transformComponents } from './layers/layer-3-components';
import { transform as transformHydration } from './layers/layer-4-hydration';
import { transform as transformTesting } from './layers/layer-6-testing';
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
  const layers: NeuroLintLayerResult[] = [];
  let currentCode = code;

  // Layer 2: HTML Entities
  try {
    const transformedCode = await transformEntities(currentCode);
    layers.push({
      name: 'layer-2-entities',
      success: true,
      code: transformedCode,
      originalSize: currentCode.length,
      transformedSize: transformedCode.length,
      executionTime: 0
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
    const transformedCode = await transformComponents(currentCode);
    layers.push({
      name: 'layer-3-components',
      success: true,
      code: transformedCode,
      originalSize: currentCode.length,
      transformedSize: transformedCode.length,
      executionTime: 0
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
    const transformedCode = await transformHydration(currentCode);
    layers.push({
      name: 'layer-4-hydration',
      success: true,
      code: transformedCode,
      originalSize: currentCode.length,
      transformedSize: transformedCode.length,
      executionTime: 0
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

  // Layer 6: Testing
  try {
    const transformedCode = await transformTesting(currentCode);
    layers.push({
      name: 'layer-6-testing',
      success: true,
      code: transformedCode,
      originalSize: currentCode.length,
      transformedSize: transformedCode.length,
      executionTime: 0
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
