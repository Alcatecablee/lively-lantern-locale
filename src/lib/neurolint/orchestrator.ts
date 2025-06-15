
import * as layer1 from "./layers/layer-1-config";
import { transformWithAST } from "./ast/orchestrator";
import { NeuroLintLayerResult } from "./types";
import { CodeValidator } from "./validation/codeValidator";

// Only Layer 1 kept for maximum reliability!
const layers = [
  {
    fn: layer1.transform,
    name: "Configuration Validation",
    description: "Optimizes TypeScript, Next.js config, and package.json with modern settings.",
    astSupported: false,
  }
];

export async function NeuroLintOrchestrator(
  code: string, 
  filePath?: string, 
  useAST: boolean = true
): Promise<{
  transformed: string;
  layers: NeuroLintLayerResult[];
}> {
  let current = code;
  const results: NeuroLintLayerResult[] = [];
  
  for (const layer of layers) {
    const startTime = Date.now();
    try {
      const previous = current;
      let next = current;
      let usedAST = false;
      let wasReverted = false;

      // We only have Layer 1 which is not AST-based
      next = await layer.fn(current, filePath);

      // Validate the transformation
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
      // Continue with remaining layers even if one fails (future-proof for more layers)
    }
  }

  return { transformed: current, layers: results };
}

function detectImprovements(before: string, after: string, usedAST: boolean = false): string[] {
  const improvements: string[] = [];
  // Layer 1 is config, not code, so these checks are just placeholders for later expansion
  if (before !== after) {
    improvements.push('Optimized configuration file');
  }
  return improvements;
}

function calculateChanges(before: string, after: string): number {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  
  let changes = Math.abs(beforeLines.length - afterLines.length);
  
  const minLength = Math.min(beforeLines.length, afterLines.length);
  for (let i = 0; i < minLength; i++) {
    if (beforeLines[i] !== afterLines[i]) {
      changes++;
    }
  }
  
  return changes;
}

export type { NeuroLintLayerResult };
