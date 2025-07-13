/**
 * Browser-compatible NeuroLint Orchestrator
 * This is the frontend version that integrates with React components
 */

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

// Browser-compatible transformation validator
class TransformationValidator {
  static validateTransformation(before: string, after: string): { shouldRevert: boolean; reason?: string } {
    if (before === after) {
      return { shouldRevert: false, reason: 'No changes made' };
    }
    
    // Check for common corruption patterns
    const corruptionPatterns = [
      {
        name: 'Duplicate React imports',
        regex: /import\s+React.*?from.*?['\"]react['\"].*?import\s+React/s
      },
      {
        name: 'Broken import statements',
        regex: /import\s*{\s*\n\s*import\s*{/g
      },
      {
        name: 'Malformed JSX',
        regex: /onClick=\{[^}]*\)[^}]*\}/g
      }
    ];
    
    for (const pattern of corruptionPatterns) {
      if (pattern.regex.test(after) && !pattern.regex.test(before)) {
        return { 
          shouldRevert: true, 
          reason: `Code corruption detected: ${pattern.name}` 
        };
      }
    }
    
    return { shouldRevert: false };
  }
}

// Layer dependency manager
class LayerDependencyManager {
  static readonly DEPENDENCIES = { 
    1: [], 
    2: [1], 
    3: [1, 2], 
    4: [1, 2, 3], 
    5: [1, 2, 3, 4], 
    6: [1, 2, 3, 4, 5] 
  };
  
  static validateAndCorrectLayers(requestedLayers: number[]): { 
    correctedLayers: number[]; 
    warnings: string[] 
  } {
    let correctedLayers = [...new Set(requestedLayers)].sort((a, b) => a - b);
    const warnings: string[] = [];
    
    for (const layerId of requestedLayers) {
      const deps = this.DEPENDENCIES[layerId] || [];
      const missing = deps.filter(dep => !correctedLayers.includes(dep));
      if (missing.length > 0) {
        correctedLayers.push(...missing);
        warnings.push(`Layer ${layerId} requires ${missing.join(', ')}. Auto-added.`);
      }
    }
    
    return { 
      correctedLayers: [...new Set(correctedLayers)].sort((a, b) => a - b), 
      warnings 
    };
  }
}

// Import layer processors - use transformWithAST from AST orchestrator
import { transformWithAST } from './ast/orchestrator';

// Layer processors for browser environment
const layerProcessors = {
  1: async (code: string): Promise<string> => {
    // Layer 1: Configuration - Basic pattern replacements for browser
    return code
      .replace(/&quot;/g, '\"')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, '&');
  },
  
  2: async (code: string): Promise<string> => {
    // Layer 2: Entity Cleanup - More comprehensive pattern fixes
    return code
      .replace(/console\.log\(/g, 'console.debug(')
      .replace(/import React, \{ /g, 'import { ')
      .replace(/<React\.Fragment>/g, '<>')
      .replace(/<\/React\.Fragment>/g, '</>');
  },
  
  3: async (code: string): Promise<string> => {
    // Layer 3: Components - Try AST first, fallback to regex
    try {
      const result = await transformWithAST(code, 'layer-3-components');
      if (result.success) {
        return result.code;
      }
    } catch (error) {
      console.warn('AST transformation failed for Layer 3, using regex fallback:', error);
    }
    
    // Regex fallback for component fixes
    return code.replace(
      /\.map\(([^}]+)\s*=>\s*<([^>]+)(?![^>]*key=)/g,
      '.map(($1, index) => <$2 key={index}'
    );
  },
  
  4: async (code: string): Promise<string> => {
    // Layer 4: Hydration - Try AST first, fallback to regex
    try {
      const result = await transformWithAST(code, 'layer-4-hydration');
      if (result.success) {
        return result.code;
      }
    } catch (error) {
      console.warn('AST transformation failed for Layer 4, using regex fallback:', error);
    }
    
    // Regex fallback for hydration fixes
    return code.replace(
      /localStorage\./g,
      'typeof window !== "undefined" ? localStorage.'
    ).replace(
      /sessionStorage\./g,
      'typeof window !== "undefined" ? sessionStorage.'
    );
  },
  
  5: async (code: string): Promise<string> => {
    // Layer 5: Next.js - App Router specific fixes
    return code.replace(
      /import.*?getServerSideProps.*?from.*?['\"][^'\"]*['\"]?;\s*/g,
      '// Removed getServerSideProps import (not supported in App Router)\n'
    );
  },
  
  6: async (code: string): Promise<string> => {
    // Layer 6: Testing - Try AST first, fallback to regex
    try {
      const result = await transformWithAST(code, 'layer-6-testing');
      if (result.success) {
        return result.code;
      }
    } catch (error) {
      console.warn('AST transformation failed for Layer 6, using regex fallback:', error);
    }
    
    // Basic testing pattern fixes
    return code;
  }
};

/**
 * Main orchestrator function for browser environment
 */
export async function NeuroLintOrchestrator(
  code: string, 
  filePath?: string, 
  dryRun: boolean = false, 
  selectedLayers: number[] = [], 
  verbose: boolean = false
): Promise<TransformationResult> {
  const startTime = performance.now();
  let transformedCode = code;
  const layerOutputs: LayerOutput[] = [];
  
  try {
    // Validate and correct layer dependencies
    const layersToRun = selectedLayers.length ? selectedLayers : LAYER_LIST.map(l => l.id);
    const { correctedLayers, warnings } = LayerDependencyManager.validateAndCorrectLayers(layersToRun);
    
    if (verbose && warnings.length) {
      console.log('Layer dependency warnings:', warnings);
    }
    
    let successfulLayers = 0;
    
    // Execute each layer in sequence
    for (const layerId of correctedLayers) {
      const layer = LAYER_LIST.find(l => l.id === layerId);
      if (!layer) continue;
      
      const layerStartTime = performance.now();
      const previousCode = transformedCode;
      
      if (verbose) {
        console.log(`🔧 Executing Layer ${layerId}: ${layer.name}`);
      }
      
      try {
        // Execute layer processor
        const processor = layerProcessors[layerId];
        if (!processor) {
          throw new Error(`No processor found for layer ${layerId}`);
        }
        
        const newCode = await processor(transformedCode);
        const executionTime = performance.now() - layerStartTime;
        
        // Validate transformation
        const validation = TransformationValidator.validateTransformation(previousCode, newCode);
        
        if (validation.shouldRevert) {
          console.warn(`⚠️ Reverting Layer ${layerId}: ${validation.reason}`);
          
          layerOutputs.push({
            id: layerId,
            name: layer.name,
            success: false,
            code: previousCode,
            executionTime,
            revertReason: validation.reason,
            reverted: true,
            description: layer.description
          });
          
          // Keep previous code (revert)
          transformedCode = previousCode;
        } else {
          // Accept transformation
          transformedCode = newCode;
          const changeCount = previousCode !== newCode ? 1 : 0;
          
          layerOutputs.push({
            id: layerId,
            name: layer.name,
            success: true,
            code: transformedCode,
            executionTime,
            changeCount,
            description: layer.description,
            improvements: changeCount > 0 ? [`Applied ${layer.name} fixes`] : []
          });
          
          if (changeCount > 0) {
            successfulLayers++;
          }
        }
        
      } catch (error) {
        const executionTime = performance.now() - layerStartTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        console.error(`❌ Layer ${layerId} failed:`, errorMessage);
        
        layerOutputs.push({
          id: layerId,
          name: layer.name,
          success: false,
          code: previousCode,
          executionTime,
          error: errorMessage,
          description: layer.description
        });
        
        // Keep previous code on error
        transformedCode = previousCode;
      }
    }
    
    const totalExecutionTime = performance.now() - startTime;
    
    return {
      success: successfulLayers > 0,
      transformed: transformedCode,
      layers: layerOutputs,
      executionTime: totalExecutionTime,
      executionStats: {
        totalLayers: correctedLayers.length,
        successfulLayers,
        failedLayers: correctedLayers.length - successfulLayers,
        totalExecutionTime
      },
      backup: code
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown orchestration error';
    console.error('Orchestration failed:', errorMessage);
    
    return {
      success: false,
      transformed: code,
      layers: layerOutputs,
      executionTime: performance.now() - startTime,
      error: errorMessage,
      backup: code
    };
  }
}
