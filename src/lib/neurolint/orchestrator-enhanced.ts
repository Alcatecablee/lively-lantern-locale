import * as layer1 from "./layers/layer-1-config";
import * as layer2 from "./layers/layer-2-entities";
import * as layer3 from "./layers/layer-3-components";
import * as layer4 from "./layers/layer-4-hydration";
import * as layer5 from "./layers/layer-5-nextjs";
import * as layer6 from "./layers/layer-6-testing";
import { transformWithAST } from "./ast/orchestrator";
import { NeuroLintLayerResult } from "./types";
import { ConflictDetector } from "./conflicts/ConflictDetector";
import { RollbackManager } from "./rollback/RollbackManager";
import { ChangeTracker } from "./conflicts/ChangeTracker";

// Enhanced orchestrator with Phase 2 capabilities
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

export async function NeuroLintEnhancedOrchestrator(
  code: string, 
  filePath?: string, 
  useAST: boolean = true,
  enableConflictDetection: boolean = true
): Promise<{
  transformed: string;
  layers: NeuroLintLayerResult[];
  conflicts?: any;
  rollbackInfo?: any;
  changeAnalysis?: any;
}> {
  let current = code;
  const results: NeuroLintLayerResult[] = [];
  
  // Phase 2 components
  const conflictDetector = new ConflictDetector();
  const rollbackManager = new RollbackManager();
  const changeTracker = new ChangeTracker();
  
  // Initial snapshot
  rollbackManager.captureSnapshot('initial', code, 'initial', { changeCount: 0, transformationTime: 0 });
  
  for (const layer of layers) {
    const startTime = Date.now();
    try {
      const previous = current;
      let next = current;
      let usedAST = false;
      let contractInfo = '';
      
      // Capture pre-transformation snapshot
      const preTransformFingerprint = `${layer.name}-pre-${Date.now()}`;
      
      // Try AST transform first if supported and enabled
      if (useAST && layer.astSupported && layer.astLayerName) {
        const astResult = await transformWithAST(current, layer.astLayerName);
        if (astResult.success) {
          next = astResult.code;
          usedAST = true;
          
          // Contract validation info
          if (astResult.contractResults) {
            const { preconditions, postconditions } = astResult.contractResults;
            contractInfo = `Contract validation - Pre: ${preconditions.passed ? '✅' : '❌'}, Post: ${postconditions.passed ? '✅' : '❌'}`;
            
            if (!preconditions.passed || !postconditions.passed) {
              console.warn(`Contract validation issues for ${layer.name}:`, {
                preconditions: preconditions.failedRules,
                postconditions: postconditions.failedRules
              });
              
              // Check if we should rollback due to contract failure
              if (!postconditions.passed) {
                const rollbackStrategy = rollbackManager.determineRollbackStrategy(
                  postconditions.failedRules.map(rule => ({ severity: 'high', description: rule })), 
                  layer.name
                );
                
                const rollbackResult = rollbackManager.executeRollback(rollbackStrategy);
                if (rollbackResult.success) {
                  next = rollbackResult.code;
                  contractInfo += ` | Rolled back: ${rollbackResult.reason}`;
                }
              }
            }
          }
          
          // Performance impact info
          if (astResult.performanceImpact) {
            const impact = astResult.performanceImpact;
            contractInfo += ` | Performance: ${impact.impact} (${impact.sizeIncrease.toFixed(1)}% size, +${impact.complexityIncrease} complexity)`;
          }
        } else {
          console.warn(`AST transform failed for ${layer.name}, using fallback:`, astResult.error);
          next = await layer.fn(current, filePath);
          contractInfo = `Fallback used due to: ${astResult.error}`;
        }
      } else {
        // Use regex-based transform
        next = await layer.fn(current, filePath);
      }
      
      // Phase 2: Track changes and detect conflicts
      if (enableConflictDetection && previous !== next) {
        const changeReport = changeTracker.trackLayerChanges(layer.name, previous, next);
        
        // Check for conflicts after each layer
        const conflictResult = changeTracker.checkForConflicts();
        
        if (conflictResult.hasConflicts && conflictResult.severity === 'high') {
          console.warn(`High severity conflicts detected in ${layer.name}:`, conflictResult.conflicts);
          
          // Determine rollback strategy
          const rollbackStrategy = rollbackManager.determineRollbackStrategy(
            conflictResult.conflicts, 
            layer.name
          );
          
          // Execute rollback if needed
          const rollbackResult = rollbackManager.executeRollback(rollbackStrategy);
          if (rollbackResult.success) {
            next = rollbackResult.code;
            contractInfo += ` | Conflict resolved via rollback: ${rollbackResult.reason}`;
          }
        }
      }
      
      const executionTime = Date.now() - startTime;
      const changeCount = calculateChanges(previous, next);
      
      // Capture post-transformation snapshot
      const postTransformFingerprint = `${layer.name}-post-${Date.now()}`;
      rollbackManager.captureSnapshot(
        layer.name, 
        next, 
        postTransformFingerprint, 
        { changeCount, transformationTime: executionTime, contractResults: contractInfo }
      );
      
      results.push({
        name: layer.name,
        description: layer.description + (contractInfo ? ` | ${contractInfo}` : ''),
        code: next,
        success: true,
        executionTime,
        changeCount,
        improvements: detectImprovements(previous, next, usedAST),
      });
      current = next;
    } catch (e: any) {
      const executionTime = Date.now() - startTime;
      
      // Handle transformation failure with rollback
      if (enableConflictDetection) {
        const rollbackStrategy = rollbackManager.determineRollbackStrategy(
          [{ severity: 'high', description: `Transformation error: ${e.message}` }], 
          layer.name
        );
        
        const rollbackResult = rollbackManager.executeRollback(rollbackStrategy);
        if (rollbackResult.success) {
          current = rollbackResult.code;
        }
      }
      
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
  
  // Generate final analysis
  const changeAnalysis = enableConflictDetection ? changeTracker.generateChangeAnalysis() : undefined;
  const conflicts = enableConflictDetection ? changeTracker.checkForConflicts() : undefined;
  const rollbackInfo = {
    snapshotHistory: rollbackManager.getSnapshotHistory(),
    availableStrategies: ['single_layer', 'cascade', 'selective', 'complete']
  };
  
  return { 
    transformed: current, 
    layers: results,
    conflicts,
    rollbackInfo,
    changeAnalysis
  };
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
    improvements.push('Used AST-based transformation with contracts');
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
