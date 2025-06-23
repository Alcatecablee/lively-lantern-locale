import * as layer1 from "./layers/layer-1-config";
import * as layer2 from "./layers/layer-2-entities";
import * as layer3 from "./layers/layer-3-components";
import * as layer4 from "./layers/layer-4-hydration";
import { transformWithAST } from "./ast/orchestrator";
import { NeuroLintLayerResult } from "./types";
import { CodeValidator } from "./validation/codeValidator";

const LAYER_LIST = [
  {
    id: 1,
    fn: layer1.transform,
    name: "Configuration Validation",
    description: "Optimizes TypeScript, Next.js config, and package.json with modern settings.",
    astSupported: false,
  },
  {
    id: 2,
    fn: layer2.transform,
    name: "Pattern & Entity Fixes",
    description: "Cleans up HTML entities, old patterns, and modernizes JS/TS code.",
    astSupported: false,
  },
  {
    id: 3,
    fn: layer3.transform,
    name: "Component Best Practices",
    description: "Solves missing key props, accessibility, prop types, and missing imports.",
    astSupported: true,
  },
  {
    id: 4,
    fn: layer4.transform,
    name: "Hydration & SSR Guard",
    description: "Fixes hydration bugs and adds SSR/localStorage protection.",
    astSupported: true,
  }
];

// Main orchestrator: now supports subset execution via layerIds
export async function NeuroLintOrchestrator(
  code: string, 
  filePath?: string, 
  useAST: boolean = true,
  layerIds: number[] = [1,2,3,4]
): Promise<{
  transformed: string;
  layers: NeuroLintLayerResult[];
  layerOutputs: string[]; // add before/after for each layer
}> {
  let current = code;
  const results: NeuroLintLayerResult[] = [];
  const layerOutputs: string[] = [code];
  
  // Only run enabled layers (preserve execution order)
  for (const layer of LAYER_LIST.filter(l => layerIds.includes(l.id))) {
    const startTime = Date.now();
    try {
      const previous = current;
      let next = current;
      let usedAST = false;
      let wasReverted = false;

      // For AST-based layers, attempt AST transform if enabled
      if (layer.astSupported && useAST) {
        const astResult = await transformWithAST(current, `layer-${layer.id}-${layer.name.toLowerCase().replace(/\s/g, '-')}`);
        next = astResult.code;
        usedAST = astResult.success;
        if (!astResult.success && astResult.usedFallback === false) {
          // fallback to non-AST transform if AST transform fails hard
          next = await layer.fn(current, filePath);
        }
      } else {
        next = await layer.fn(current, filePath);
      }

      // Validate transformation on non-config layers
      const validation = CodeValidator.compareBeforeAfter(previous, next);
      if (validation.shouldRevert) {
        console.warn(`Reverting ${layer.name} transformation: ${validation.reason}`);
        next = previous; // Revert to previous state
        wasReverted = true;
      }
      
      const executionTime = Date.now() - startTime;
      const changeCount = calculateChanges(previous, next);
      const improvements = detectImprovements(previous, next, usedAST);
      if (wasReverted) {
        improvements.push('Prevented code corruption');
      }
      
      results.push({
        name: layer.name,
        description: layer.description,
        code: next,
        success: !wasReverted,
        executionTime,
        changeCount,
        improvements,
        message: wasReverted ? `Transformation reverted: ${validation.reason}` : undefined,
      });
      current = next;
      layerOutputs.push(next); // Store output after this layer
    } catch (e: any) {
      const executionTime = Date.now() - startTime;
      results.push({
        name: layer.name,
        description: layer.description,
        message: String(e),
        code: current,
        success: false,
        executionTime,
        changeCount: 0,
      });
      layerOutputs.push(current);
    }
  }

  return { transformed: current, layers: results, layerOutputs };
}

function detectImprovements(before: string, after: string, usedAST: boolean = false): string[] {
  const improvements: string[] = [];
  if (before !== after) improvements.push('Layer transformation applied');
  return improvements;
}

function calculateChanges(before: string, after: string): number {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  let changes = Math.abs(beforeLines.length - afterLines.length);

  const minLength = Math.min(beforeLines.length, afterLines.length);
  for (let i = 0; i < minLength; i++) {
    if (beforeLines[i] !== afterLines[i]) changes++;
  }
  return changes;
}

// Expose the LAYER_LIST so TestRunner can provide names/descriptions
export { LAYER_LIST };
export type { NeuroLintLayerResult };
