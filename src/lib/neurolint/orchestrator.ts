import { transformWithAST } from './ast/orchestrator';
import { BackupManager } from './backup/backupManager';
import { CodeValidator } from './validation/codeValidator';
import { DiagnosticMonitor } from './diagnostics/monitor';
import { LayerDependencyManager } from './dependencies/LayerDependencyManager';
import { SmartLayerSelector } from './selection/SmartLayerSelector';
import { ErrorRecoverySystem } from './recovery/ErrorRecoverySystem';
import { PerformanceOptimizer } from './performance/PerformanceOptimizer';

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
}

export interface TransformationResult {
  success: boolean;
  transformed: string;
  layers: LayerOutput[];
  executionTime: number;
  error?: string;
  executionStats?: any;
  diagnostics?: any;
}

const LAYER_CONFIG: { [key: number]: any } = {
  1: { name: 'layer-1-config', supportsAST: false, regexTransform: require('../layers/fix-layer-1-config').runLayer1Fixes },
  2: { name: 'layer-2-patterns', supportsAST: false, regexTransform: require('../layers/fix-layer-2-patterns').runLayer2Fixes },
  3: { name: 'layer-3-components', supportsAST: true },
  4: { name: 'layer-4-hydration', supportsAST: true },
  5: { name: 'layer-5-nextjs', supportsAST: false, regexTransform: require('../layers/fix-layer-5-nextjs').runLayer5Fixes },
  6: { name: 'layer-6-testing', supportsAST: true }
};

function calculateChanges(before: string, after: string): number {
  // Sophisticated change detection algorithm (example: line diff)
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  let changes = 0;

  // Simple line count difference
  changes = Math.abs(beforeLines.length - afterLines.length);

  // More sophisticated diffing can be implemented here

  return changes;
}

export async function NeuroLintOrchestrator(
  code: string,
  filePath?: string,
  dryRun: boolean = false,
  selectedLayers?: number[]
): Promise<TransformationResult> {
  const startTime = performance.now();
  
  // BACKUP SYSTEM
  if (!dryRun) {
    await BackupManager.createBackup(code, filePath);
  }

  try {
    // SOPHISTICATED LAYER DEPENDENCY MANAGEMENT
    let layersToExecute = selectedLayers || [1, 2, 3, 4, 5, 6];
    
    const dependencyValidation = LayerDependencyManager.validateAndCorrectLayers(layersToExecute);
    if (dependencyValidation.warnings.length > 0) {
      console.warn('🔄 Layer dependency corrections:', dependencyValidation.warnings.join(', '));
    }
    layersToExecute = dependencyValidation.correctedLayers;

    // SMART LAYER SELECTION ANALYSIS
    if (!selectedLayers) {
      const smartRecommendation = SmartLayerSelector.analyzeAndRecommend(code, filePath);
      console.log(`🧠 Smart analysis (confidence: ${(smartRecommendation.confidence * 100).toFixed(1)}%):`, 
        smartRecommendation.reasoning.join(', '));
      
      if (smartRecommendation.confidence > 0.7) {
        layersToExecute = smartRecommendation.recommendedLayers;
        console.log('✨ Using smart layer selection:', layersToExecute.join(', '));
      }
      
      if (smartRecommendation.riskAssessment.level === 'high') {
        console.warn('⚠️ High transformation risk detected:', 
          smartRecommendation.riskAssessment.factors.join(', '));
      }
    }

    // PERFORMANCE-OPTIMIZED EXECUTION
    const optimizedResult = await PerformanceOptimizer.executeOptimized(
      code,
      layersToExecute,
      {
        useCache: true,
        skipUnnecessary: true,
        adaptiveOptimization: true
      }
    );

    if (optimizedResult.fromCache) {
      console.log(`⚡ Performance: Cache hit (${optimizedResult.executionTime.toFixed(0)}ms)`);
      return {
        success: true,
        transformed: optimizedResult.result,
        layers: [{
          id: 0,
          name: 'Cached Result',
          success: true,
          executionTime: optimizedResult.executionTime,
          improvements: ['Retrieved from intelligent cache']
        }],
        executionTime: optimizedResult.executionTime,
        executionStats: {
          totalLayers: layersToExecute.length,
          successfulLayers: layersToExecute.length,
          fromCache: true,
          performanceGains: optimizedResult.performanceGains || 0
        }
      };
    }

    // SOPHISTICATED LAYER EXECUTION WITH ERROR RECOVERY
    let current = code;
    const layerOutputs: LayerOutput[] = [];
    const executionStartTime = performance.now();

    for (const layerId of layersToExecute) {
      const layerInfo = LAYER_CONFIG[layerId];
      if (!layerInfo) {
        console.warn(`⚠️ Unknown layer ${layerId}, skipping`);
        continue;
      }

      console.log(`🔧 Executing Layer ${layerId}: ${layerInfo.name}...`);
      
      // SOPHISTICATED ERROR RECOVERY EXECUTION
      const layerResult = await ErrorRecoverySystem.executeWithRecovery(
        current,
        layerId,
        { dryRun, verbose: false }
      );

      if (layerResult.success) {
        // COMPREHENSIVE VALIDATION
        const validationResult = await CodeValidator.validateTransformation({
          before: current,
          after: layerResult.code,
          layerId,
          filePath
        });

        if (validationResult.shouldRevert) {
          console.warn(`⚠️ Reverting Layer ${layerId}: ${validationResult.reason}`);
          layerOutputs.push({
            id: layerId,
            name: layerInfo.name,
            success: false,
            code: current, // Keep previous code
            executionTime: layerResult.executionTime,
            changeCount: 0,
            revertReason: validationResult.reason
          });
        } else {
          current = layerResult.code;
          layerOutputs.push({
            id: layerId,
            name: layerInfo.name,
            success: true,
            code: current,
            executionTime: layerResult.executionTime,
            changeCount: calculateChanges(current, layerResult.code),
            improvements: layerResult.improvements || []
          });
          
          console.log(`✅ Layer ${layerId} completed (${layerResult.executionTime.toFixed(0)}ms)`);
        }
      } else {
        console.error(`❌ Layer ${layerId} failed:`, layerResult.error);
        
        // SOPHISTICATED ERROR RECOVERY REPORTING
        if (layerResult.recoveryActions.length > 0) {
          console.log(`🔄 Recovery attempts: ${layerResult.recoveryActions.join(', ')}`);
        }
        
        if (layerResult.suggestion) {
          console.log(`💡 Suggestion: ${layerResult.suggestion}`);
        }

        layerOutputs.push({
          id: layerId,
          name: layerInfo.name,
          success: false,
          code: current, // Keep previous safe state
          executionTime: layerResult.executionTime,
          changeCount: 0,
          error: layerResult.error,
          errorCategory: layerResult.errorCategory,
          suggestion: layerResult.suggestion,
          recoveryOptions: layerResult.recoveryOptions
        });
      }

      // DIAGNOSTIC MONITORING
      DiagnosticMonitor.recordLayerExecution({
        layerId,
        success: layerResult.success,
        executionTime: layerResult.executionTime,
        codeLength: current.length,
        errorCategory: layerResult.errorCategory
      });
    }

    const totalExecutionTime = performance.now() - executionStartTime;
    const successfulLayers = layerOutputs.filter(layer => layer.success).length;

    // COMPREHENSIVE EXECUTION STATISTICS
    const executionStats = {
      totalLayers: layersToExecute.length,
      successfulLayers,
      failedLayers: layersToExecute.length - successfulLayers,
      totalExecutionTime,
      averageLayerTime: totalExecutionTime / layersToExecute.length,
      fromCache: false,
      performanceGains: optimizedResult.performanceGains || 0,
      optimizations: optimizedResult.optimizations || [],
      adaptiveOptimizations: optimizedResult.adaptiveOptimizations || []
    };

    console.log(`\n🎉 Orchestration completed: ${successfulLayers}/${layersToExecute.length} layers successful`);
    console.log(`⏱️ Total execution time: ${totalExecutionTime.toFixed(0)}ms`);
    
    if (optimizedResult.optimizations.length > 0) {
      console.log(`⚡ Optimizations applied: ${optimizedResult.optimizations.join(', ')}`);
    }

    return {
      success: successfulLayers > 0,
      transformed: current,
      layers: layerOutputs,
      executionTime: totalExecutionTime,
      executionStats,
      diagnostics: DiagnosticMonitor.generateReport()
    };

  } catch (error) {
    console.error('❌ Orchestration failed:', error);
    
    // SOPHISTICATED ERROR RECOVERY FOR ORCHESTRATION LEVEL
    const recoveredCode = await BackupManager.restoreLatest();
    
    return {
      success: false,
      transformed: recoveredCode || code,
      layers: [],
      executionTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown orchestration error',
      executionStats: {
        totalLayers: 0,
        successfulLayers: 0,
        failedLayers: 1,
        totalExecutionTime: performance.now() - startTime,
        averageLayerTime: 0,
        fromCache: false,
        error: 'Orchestration level failure'
      }
    };
  }
}

// SOPHISTICATED LAYER EXECUTION WITH AST/REGEX FALLBACK
async function executeLayer(layerId: number, code: string, options: { dryRun?: boolean; verbose?: boolean } = {}): Promise<string> {
  const layerConfig = LAYER_CONFIG[layerId];
  
  if (!layerConfig) {
    throw new Error(`Layer ${layerId} configuration not found`);
  }

  try {
    // For layers that support AST transformation
    if (layerConfig.supportsAST) {
      try {
        console.log(`🌳 Using AST transformation for Layer ${layerId}`);
        const astResult = await transformWithAST(code, layerConfig.name);
        
        if (astResult.success && astResult.code !== code) {
          return astResult.code;
        }
        
        if (astResult.usedFallback) {
          console.warn(`⚠️ AST fallback used for Layer ${layerId}: ${astResult.error}`);
        }
        
      } catch (astError) {
        console.warn(`⚠️ AST transformation failed for Layer ${layerId}, using regex fallback:`, 
          astError instanceof Error ? astError.message : 'Unknown AST error');
      }
    }

    // Fallback to regex-based transformation
    if (layerConfig.regexTransform) {
      console.log(`🔄 Using regex transformation for Layer ${layerId}`);
      return await layerConfig.regexTransform(code, options);
    }

    // If no transformation methods available
    throw new Error(`No transformation method available for Layer ${layerId}`);

  } catch (error) {
    throw new Error(`Layer ${layerId} execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
