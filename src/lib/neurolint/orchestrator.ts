import * as layer1 from "./layers/layer-1-config";
import * as layer2 from "./layers/layer-2-entities";
import * as layer3 from "./layers/layer-3-components";
import * as layer4 from "./layers/layer-4-hydration";
import * as layer5 from "./layers/layer-5-nextjs";
import * as layer6 from "./layers/layer-6-testing";
import * as layer7 from "./layers/layer-7-ai-patterns";
import { transformWithAST } from "./ast/orchestrator";
import { NeuroLintLayerResult } from "./types";
import { CodeValidator } from "./validation/codeValidator";
import { AdvancedValidator } from "./validation/advancedValidator";
import { ContextAnalyzer } from "./context/contextAnalyzer";
import { IntelligentRollback } from "./rollback/intelligentRollback";

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
  },
  {
    id: 5,
    fn: layer5.transform,
    name: "Next.js Optimization",
    description: "Fixes Next.js specific patterns and optimizations.",
    astSupported: false,
  },
  {
    id: 6,
    fn: layer6.transform,
    name: "Testing & Validation",
    description: "Adds error boundaries, prop validation, and performance optimizations.",
    astSupported: false,
  },
  {
    id: 7,
    fn: layer7.transform,
    name: "AI Pattern Detection",
    description: "Uses AI to detect anti-patterns and suggest modern alternatives.",
    astSupported: true,
  }
];

export async function NeuroLintOrchestrator(
  code: string, 
  filePath?: string, 
  useAST: boolean = true,
  layerIds: number[] = [1,2,3,4,5,6,7]
): Promise<{
  transformed: string;
  layers: NeuroLintLayerResult[];
  layerOutputs: string[];
  context: any;
  rollbackInfo: any;
}> {
  let current = code;
  const results: NeuroLintLayerResult[] = [];
  const layerOutputs: string[] = [code];
  
  // Analyze file context for context-aware transformations
  const context = ContextAnalyzer.analyzeFile(code, filePath);
  const rollbackManager = new IntelligentRollback();
  
  console.log(`🧠 NeuroLint Context Analysis:`, {
    type: context.type,
    framework: context.framework,
    features: context.features,
    recommendations: ContextAnalyzer.getContextualRecommendations(context)
  });
  
  // Filter layers based on context (smart layer selection)
  const contextualLayers = layerIds.filter(layerId => {
    const layer = LAYER_LIST.find(l => l.id === layerId);
    if (!layer) return false;
    
    // Skip certain layers based on context
    if (context.type === 'config' && layerId > 1) return false;
    if (context.framework === 'vanilla' && [4, 5].includes(layerId)) return false;
    if (!context.features.includes('list-rendering') && layerId === 3) return false;
    
    return true;
  });
  
  console.log(`🎯 Running contextual layers: ${contextualLayers.join(', ')}`);
  
  // Execute layers with enhanced validation and rollback
  for (const layer of LAYER_LIST.filter(l => contextualLayers.includes(l.id))) {
    const startTime = Date.now();
    try {
      const previous = current;
      let next = current;
      let usedAST = false;
      let wasReverted = false;
      let snapshotId = '';

      // Enhanced transformation with AST fallback
      if (layer.astSupported && useAST) {
        const astResult = await transformWithAST(current, `layer-${layer.id}-${layer.name.toLowerCase().replace(/\s/g, '-')}`);
        next = astResult.code;
        usedAST = astResult.success;
        if (!astResult.success && astResult.usedFallback === false) {
          next = await layer.fn(current, filePath);
        }
      } else {
        next = await layer.fn(current, filePath);
      }

      // Advanced validation with semantic checking
      const validation = await AdvancedValidator.validateTransformation(previous, next, context);
      
      // Create snapshot for rollback decision
      snapshotId = rollbackManager.createSnapshot(
        layer.id,
        layer.name,
        previous,
        next,
        validation
      );
      
      // Intelligent rollback decision
      const rollbackDecision = rollbackManager.evaluateRollback(snapshotId);
      
      if (rollbackDecision.shouldRollback) {
        console.warn(`🔄 ${rollbackDecision.suggestedAction.toUpperCase()}: ${layer.name} - ${rollbackDecision.reason}`);
        
        if (rollbackDecision.suggestedAction === 'rollback') {
          const rollbackResult = rollbackManager.performRollback(snapshotId, 'full');
          next = rollbackResult.restoredCode;
          wasReverted = true;
        } else if (rollbackDecision.suggestedAction === 'partial-rollback') {
          const rollbackResult = rollbackManager.performRollback(snapshotId, 'partial');
          next = rollbackResult.restoredCode;
          wasReverted = true;
        }
      }
      
      const executionTime = Date.now() - startTime;
      const changeCount = calculateChanges(previous, next);
      const improvements = detectImprovements(previous, next, usedAST, validation);
      
      if (wasReverted) {
        improvements.push(`Prevented issues: ${rollbackDecision.reason}`);
      } else if (validation.suggestions.length > 0) {
        improvements.push(...validation.suggestions.slice(0, 2)); // Limit suggestions
      }
      
      results.push({
        name: layer.name,
        description: layer.description,
        code: next,
        success: !wasReverted,
        executionTime,
        changeCount,
        improvements,
        message: wasReverted ? `${rollbackDecision.suggestedAction}: ${rollbackDecision.reason}` : undefined,
      });
      
      current = next;
      layerOutputs.push(next);
      
    } catch (e: any) {
      const executionTime = Date.now() - startTime;
      results.push({
        name: layer.name,
        description: layer.description,
        message: `Layer failed: ${e.message}`,
        code: current,
        success: false,
        executionTime,
        changeCount: 0,
      });
      layerOutputs.push(current);
    }
  }

  return { 
    transformed: current, 
    layers: results, 
    layerOutputs,
    context,
    rollbackInfo: {
      snapshots: rollbackManager.getSnapshotHistory(),
      recommendations: ContextAnalyzer.getContextualRecommendations(context)
    }
  };
}

function detectImprovements(before: string, after: string, usedAST: boolean = false, validation?: any): string[] {
  const improvements: string[] = [];
  
  if (before !== after) {
    improvements.push('Code transformation applied');
  }
  
  if (usedAST) {
    improvements.push('Used AST analysis for precise changes');
  }
  
  // Add validation-based improvements
  if (validation?.suggestions) {
    improvements.push(...validation.suggestions.slice(0, 2));
  }
  
  // Check for specific improvements
  if (!before.includes('aria-') && after.includes('aria-')) {
    improvements.push('Enhanced accessibility');
  }
  
  if (!before.includes('key=') && after.includes('key=')) {
    improvements.push('Added React keys');
  }
  
  if (before.includes(': any') && !after.includes(': any')) {
    improvements.push('Improved type safety');
  }
  
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

export { LAYER_LIST };
export type { NeuroLintLayerResult };
