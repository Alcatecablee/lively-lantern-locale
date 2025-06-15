import * as layer1 from "./layers/layer-1-config";
import * as layer2 from "./layers/layer-2-entities";
import * as layer3 from "./layers/layer-3-components";
import * as layer4 from "./layers/layer-4-hydration";
import * as layer5 from "./layers/layer-5-nextjs";
import * as layer6 from "./layers/layer-6-testing";
import { transformWithAST } from "./ast/orchestrator";
import { NeuroLintLayerResult } from "./types";
import { CodeValidator } from "./validation/codeValidator";

// Enhanced orchestrator with AST-based transformations and validation
const layers = [
  {
    fn: layer1.transform,
    name: "Configuration Validation",
    description: "Optimizes TypeScript, Next.js config, and package.json with modern settings.",
    astSupported: false,
  },
  {
    fn: layer2.transform,
    name: "HTML Entity & Pattern Cleanup",
    description: "Fixes HTML entity corruption, cleans imports, and standardizes patterns.",
    astSupported: false,
  },
  {
    fn: layer3.transform,
    name: "Component Enhancement",
    description: "Adds missing props, imports, accessibility attributes, and component interfaces.",
    astSupported: true,
    astLayerName: "layer-3-components",
  },
  {
    fn: layer4.transform,
    name: "Hydration & SSR Protection",
    description: "Adds SSR guards, fixes hydration mismatches, and protects client-only APIs.",
    astSupported: true,
    astLayerName: "layer-4-hydration",
  },
  {
    fn: layer5.transform,
    name: "Next.js App Router Optimization",
    description: "Fixes 'use client' placement, import corruption, and App Router patterns.",
    astSupported: false,
  },
  {
    fn: layer6.transform,
    name: "Testing & Validation Enhancement",
    description: "Adds error boundaries, prop validation, loading states, and performance optimizations.",
    astSupported: false,
  },
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
      
      // Try AST transform first if supported and enabled
      if (useAST && layer.astSupported && layer.astLayerName) {
        const astResult = await transformWithAST(current, layer.astLayerName);
        if (astResult.success) {
          next = astResult.code;
          usedAST = true;
        } else {
          console.warn(`AST transform failed for ${layer.name}, using fallback:`, astResult.error);
          next = await layer.fn(current, filePath);
        }
      } else {
        // Use regex-based transform
        next = await layer.fn(current, filePath);
      }
      
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
      // Continue with remaining layers even if one fails
    }
  }
  
  return { transformed: current, layers: results };
}

function detectImprovements(before: string, after: string, usedAST: boolean = false): string[] {
  const improvements: string[] = [];
  
  // Detect specific improvements
  if (before.includes('&quot;') && !after.includes('&quot;')) {
    improvements.push('Fixed HTML entity corruption');
  }
  
  if (!before.includes("'use client'") && after.includes("'use client'")) {
    improvements.push('Added use client directive');
  }
  
  if (!before.includes('aria-label') && after.includes('aria-label')) {
    improvements.push('Added accessibility attributes');
  }
  
  if (!before.includes('key=') && after.includes('key=')) {
    improvements.push('Added missing key props');
  }
  
  if (!before.includes('interface') && after.includes('interface')) {
    improvements.push('Added TypeScript interfaces');
  }
  
  if (!before.includes('typeof window') && after.includes('typeof window')) {
    improvements.push('Added SSR guards');
  }
  
  if (!before.includes('try') && after.includes('try')) {
    improvements.push('Added error handling');
  }
  
  if (before.includes('console.log') && !after.includes('console.log')) {
    improvements.push('Optimized console statements');
  }
  
  if (usedAST) {
    improvements.push('Used AST-based transformation');
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
