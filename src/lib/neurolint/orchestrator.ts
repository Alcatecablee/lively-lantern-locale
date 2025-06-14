
import * as layer1 from "./layers/layer-1-config";
import * as layer2 from "./layers/layer-2-entities";
import * as layer3 from "./layers/layer-3-components";
import * as layer4 from "./layers/layer-4-hydration";
import * as layer5 from "./layers/layer-5-nextjs";
import * as layer6 from "./layers/layer-6-testing";
import { NeuroLintLayerResult } from "./types";

// Enhanced orchestrator with real transformation capabilities
const layers = [
  {
    fn: layer1.transform,
    name: "Configuration Validation",
    description: "Optimizes TypeScript, Next.js config, and package.json with modern settings.",
  },
  {
    fn: layer2.transform,
    name: "HTML Entity & Pattern Cleanup",
    description: "Fixes HTML entity corruption, cleans imports, and standardizes patterns.",
  },
  {
    fn: layer3.transform,
    name: "Component Enhancement",
    description: "Adds missing props, imports, accessibility attributes, and component interfaces.",
  },
  {
    fn: layer4.transform,
    name: "Hydration & SSR Protection",
    description: "Adds SSR guards, fixes hydration mismatches, and protects client-only APIs.",
  },
  {
    fn: layer5.transform,
    name: "Next.js App Router Optimization",
    description: "Fixes 'use client' placement, import corruption, and App Router patterns.",
  },
  {
    fn: layer6.transform,
    name: "Testing & Validation Enhancement",
    description: "Adds error boundaries, prop validation, loading states, and performance optimizations.",
  },
];

export async function NeuroLintOrchestrator(code: string, filePath?: string): Promise<{
  transformed: string;
  layers: NeuroLintLayerResult[];
}> {
  let current = code;
  const results: NeuroLintLayerResult[] = [];
  
  for (const layer of layers) {
    const startTime = Date.now();
    try {
      const previous = current;
      const next = await layer.fn(current, filePath);
      const executionTime = Date.now() - startTime;
      
      // Calculate changes made
      const changeCount = calculateChanges(previous, next);
      
      results.push({
        name: layer.name,
        description: layer.description,
        code: next,
        success: true,
        executionTime,
        changeCount,
        improvements: detectImprovements(previous, next),
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

function detectImprovements(before: string, after: string): string[] {
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
  
  return improvements;
}

export type { NeuroLintLayerResult };
