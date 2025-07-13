const fs = require('fs');
const path = require('path');

// Import orchestration components following the guide patterns
const LayerIntegrator = require('./layer-integrator');
const EnhancedSmartLayerSelector = require('./orchestration/enhanced-selector');
const LayerDependencyManager = require('./orchestration/dependencies');
const ErrorRecoverySystem = require('./orchestration/recovery');
const TransformationValidator = require('./orchestration/validator');

/**
 * Enhanced NeuroLint Orchestrator - Following Orchestration Implementation Patterns
 * Implements Safe Layer Execution Pattern with rollback capability
 */
class EnhancedNeuroLintOrchestrator {
  constructor(options = {}) {
    this.options = {
      verbose: false,
      dryRun: false,
      useAST: true,
      useCache: true,
      createBackups: false,
      failFast: false,
      timeout: 30000,
      ...options
    };
    
    // Initialize with actual layer integrator
    this.layerIntegrator = new LayerIntegrator(this.options);
    
    // Performance tracking
    this.performance = {
      startTime: 0,
      endTime: 0,
      layerTimes: {},
      cacheHits: 0,
      cacheMisses: 0
    };
    
    // Error recovery system
    this.errorRecovery = new ErrorRecoverySystem();
    
    // Setup cleanup handlers
    this.layerIntegrator.setupCleanup();
  }

  /**
   * Execute layers using Safe Layer Execution Pattern
   * Each layer is validated before acceptance with rollback capability
   */
  async execute(code, filePath, requestedLayers = [1, 2, 3, 4]) {
    this.performance.startTime = Date.now();
    
    try {
      // Step 1: Validate and auto-correct layer selection using dependency manager
      const layerValidation = LayerDependencyManager.validateAndCorrectLayers(requestedLayers);
      
      if (layerValidation.warnings.length > 0) {
        console.log('WARNING: Layer Dependency Issues:');
        layerValidation.warnings.forEach(warning => {
          console.log(`  ${warning}`);
        });
      }
      
      const finalLayers = layerValidation.correctedLayers;
      
      // Step 2: Analyze code for smart recommendations
      let analysis = {};
      try {
        analysis = EnhancedSmartLayerSelector.analyzeAndRecommend(code, filePath);
        console.log('INFO: Code Analysis Results:');
        console.log(`  Detected Issues: ${analysis.detectedIssues ? analysis.detectedIssues.length : 0}`);
        console.log(`  Recommended Layers: ${analysis.recommendedLayers ? analysis.recommendedLayers.join(', ') : 'none'}`);
        console.log(`  Confidence: ${analysis.confidence ? (analysis.confidence * 100).toFixed(1) : 0}%`);
        console.log(`  Estimated Impact: ${analysis.estimatedImpact ? analysis.estimatedImpact.level : 'unknown'}`);
      } catch (analysisError) {
        console.warn(`WARNING: Code analysis failed: ${analysisError.message}`);
        analysis = { detectedIssues: [], recommendedLayers: finalLayers, confidence: 0.5 };
      }

      console.log(`LAYERS: Executing ${finalLayers.join(', ')}`);

      // Step 3: Execute layers with Safe Layer Execution Pattern
      const executionResult = await this.executeLayers(code, finalLayers, filePath, this.options);
      
      // Step 4: Generate comprehensive result
      const result = {
        success: executionResult.success,
        originalCode: code,
        finalCode: executionResult.finalCode,
        executedLayers: executionResult.successfulLayers,
        layerResults: executionResult.results,
        states: executionResult.states,
        analysis: analysis,
        performance: {
          totalExecutionTime: executionResult.totalExecutionTime,
          layerBreakdown: executionResult.results.map(r => ({
            layerId: r.layerId,
            executionTime: r.executionTime,
            changeCount: r.changeCount,
            success: r.success
          }))
        },
        summary: {
          totalChanges: executionResult.results.reduce((sum, r) => sum + (r.changeCount || 0), 0),
          executedLayers: executionResult.results.filter(r => r.success).map(r => r.layerId),
          failedLayers: executionResult.results.filter(r => !r.success).length,
          executionTime: executionResult.totalExecutionTime
        },
        recommendations: this.generateRecommendations(executionResult.results, analysis),
        metadata: {
          timestamp: new Date().toISOString(),
          filePath: filePath,
          requestedLayers: requestedLayers,
          finalLayers: finalLayers,
          orchestratorVersion: '2.0.0'
        }
      };

      this.performance.endTime = Date.now();
      return result;

    } catch (error) {
      // Enterprise error handling
      const errorInfo = this.errorRecovery.handleError(error, {
        code,
        filePath,
        requestedLayers,
        options: this.options
      });

      console.error('ERROR: Orchestration failed:', errorInfo.message);
      console.error('CATEGORY:', errorInfo.category);
      console.error('SUGGESTION:', errorInfo.suggestion);

      return {
        success: false,
        error: errorInfo,
        originalCode: code,
        finalCode: code,
        executedLayers: [],
        layerResults: [],
        analysis: {},
        performance: { totalExecutionTime: 0 },
        summary: {
          totalChanges: 0,
          executedLayers: [],
          failedLayers: 0,
          executionTime: 0
        }
      };
    }
  }

  /**
   * Safe Layer Execution Pattern Implementation
   * Executes layers with automatic rollback on failure
   * Each layer is validated before acceptance
   */
  async executeLayers(code, enabledLayers, filePath, options = {}) {
    let current = code;
    const results = [];
    const states = [code]; // Track all intermediate states for rollback
    const startTime = Date.now();
    
    for (const layerId of enabledLayers) {
      const previous = current;
      const layerStartTime = Date.now();
      
      if (options.verbose) {
        console.log(`INFO: Executing Layer ${layerId}...`);
      }
      
      try {
        // Apply transformation using layer integrator
        const layerResult = await this.layerIntegrator.runSingleLayer(
          current,
          filePath,
          layerId,
          options
        );
        
        if (layerResult.success) {
          const transformed = layerResult.transformedCode;
          
          // Validate transformation safety using incremental validation
          const validation = TransformationValidator.validateTransformation(previous, transformed);
          
          if (validation.shouldRevert) {
            console.warn(`WARNING: Reverting Layer ${layerId}: ${validation.reason}`);
            current = previous; // Rollback to safe state
            
            results.push({
              layerId,
              name: this.getLayerName(layerId),
              success: false,
              code: previous,
              executionTime: Date.now() - layerStartTime,
              changeCount: 0,
              revertReason: validation.reason,
              reverted: true
            });
          } else {
            current = transformed; // Accept changes
            states.push(current);
            
            const changes = this.calculateChanges(previous, transformed);
            const improvements = this.detectImprovements(previous, transformed, layerId);
            
            results.push({
              layerId,
              name: this.getLayerName(layerId),
              success: true,
              code: current,
              executionTime: Date.now() - layerStartTime,
              changeCount: changes,
              improvements: improvements,
              transformedCode: transformed
            });
            
            if (options.verbose && changes > 0) {
              console.log(`SUCCESS: Layer ${layerId} completed (${changes} changes)`);
              improvements.forEach(improvement => {
                console.log(`  ${improvement}`);
              });
            }
          }
        } else {
          // Layer execution failed
          results.push({
            layerId,
            name: this.getLayerName(layerId),
            success: false,
            code: previous, // Keep previous safe state
            executionTime: Date.now() - layerStartTime,
            changeCount: 0,
            error: layerResult.error
          });
          
          console.error(`ERROR: Layer ${layerId} failed: ${layerResult.error}`);
          
          // Continue with previous code
          current = previous;
          
          if (options.failFast) {
            break;
          }
        }
        
      } catch (error) {
        console.error(`ERROR: Layer ${layerId} execution failed:`, error.message);
        
        results.push({
          layerId,
          name: this.getLayerName(layerId),
          success: false,
          code: previous, // Keep previous safe state
          executionTime: Date.now() - layerStartTime,
          changeCount: 0,
          error: error.message
        });
        
        // Continue with previous code
        current = previous;
        
        if (options.failFast) {
          break;
        }
      }
    }
    
    return {
      success: results.length > 0 && results.some(r => r.success),
      finalCode: current,
      results,
      states,
      totalExecutionTime: Date.now() - startTime,
      successfulLayers: results.filter(r => r.success).map(r => r.layerId)
    };
  }

  /**
   * Calculate changes between code strings
   */
  calculateChanges(before, after) {
    if (before === after) return 0;
    
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

  /**
   * Detect improvements made by transformations
   */
  detectImprovements(before, after, layerId) {
    const improvements = [];
    
    try {
      // Layer-specific improvement detection
      switch (layerId) {
        case 1:
          if (before.includes('"target": "es5"') && after.includes('"target": "ES2022"')) {
            improvements.push('TypeScript target upgraded to ES2022');
          }
          if (before.includes('reactStrictMode: false') && after.includes('reactStrictMode: true')) {
            improvements.push('React strict mode enabled');
          }
          break;
          
        case 2:
          const htmlEntityCount = (before.match(/&quot;|&amp;|&lt;|&gt;/g) || []).length;
          const htmlEntityCountAfter = (after.match(/&quot;|&amp;|&lt;|&gt;/g) || []).length;
          if (htmlEntityCount > htmlEntityCountAfter) {
            improvements.push(`${htmlEntityCount - htmlEntityCountAfter} HTML entities cleaned`);
          }
          
          const consoleCount = (before.match(/console\.log/g) || []).length;
          const consoleCountAfter = (after.match(/console\.log/g) || []).length;
          if (consoleCount > consoleCountAfter) {
            improvements.push(`${consoleCount - consoleCountAfter} console.log statements optimized`);
          }
          break;
          
        case 3:
          const keyPropCount = (before.match(/\.map\([^)]*\)\s*=>\s*<[^>]*(?!.*key=)/g) || []).length;
          const keyPropCountAfter = (after.match(/\.map\([^)]*\)\s*=>\s*<[^>]*(?!.*key=)/g) || []).length;
          if (keyPropCount > keyPropCountAfter) {
            improvements.push(`${keyPropCount - keyPropCountAfter} missing key props added`);
          }
          break;
          
        case 4:
          const localStorageCount = (before.match(/(?<!typeof window !== "undefined" && )localStorage\./g) || []).length;
          const localStorageCountAfter = (after.match(/(?<!typeof window !== "undefined" && )localStorage\./g) || []).length;
          if (localStorageCount > localStorageCountAfter) {
            improvements.push(`${localStorageCount - localStorageCountAfter} SSR guards added`);
          }
          break;
          
        case 5:
          improvements.push('Next.js optimizations applied');
          break;
          
        case 6:
          improvements.push('Testing improvements applied');
          break;
      }
      
      // Generic improvements
      if (improvements.length === 0 && before !== after) {
        const changeCount = this.calculateChanges(before, after);
        improvements.push(`${changeCount} code transformations applied`);
      }
      
    } catch (error) {
      console.warn(`WARNING: Could not detect improvements for layer ${layerId}: ${error.message}`);
      improvements.push('Transformations applied');
    }
    
    return improvements;
  }

  /**
   * Get layer name
   */
  getLayerName(layerId) {
    const names = {
      1: 'Configuration',
      2: 'Entity Cleanup',
      3: 'Components',
      4: 'Hydration',
      5: 'Next.js',
      6: 'Testing'
    };
    return names[layerId] || `Layer ${layerId}`;
  }

  /**
   * Generate actionable recommendations based on results
   */
  generateRecommendations(layerResults, analysis) {
    const recommendations = [];
    
    try {
      const failedLayers = layerResults.filter(r => !r.success);
      const successfulLayers = layerResults.filter(r => r.success);
      
      if (failedLayers.length === 0) {
        recommendations.push('SUCCESS: All layers executed successfully');
      } else {
        recommendations.push(`WARNING: ${failedLayers.length} layers failed`);
        failedLayers.forEach(layer => {
          recommendations.push(`  Layer ${layer.layerId}: ${layer.error || 'Unknown error'}`);
        });
      }
      
      if (successfulLayers.length > 0) {
        const totalChanges = successfulLayers.reduce((sum, r) => sum + (r.changeCount || 0), 0);
        if (totalChanges > 0) {
          recommendations.push(`INFO: Applied ${totalChanges} total changes across ${successfulLayers.length} layers`);
        }
      }
      
      // Add specific recommendations based on analysis
      if (analysis.detectedIssues && analysis.detectedIssues.length > 0) {
        const criticalIssues = analysis.detectedIssues.filter(i => i.severity === 'high').length;
        if (criticalIssues > 0) {
          recommendations.push(`CRITICAL: ${criticalIssues} high-severity issues detected`);
        }
      }
      
    } catch (error) {
      recommendations.push(`WARNING: Could not generate recommendations: ${error.message}`);
    }
    
    return recommendations;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.layerIntegrator) {
      this.layerIntegrator.cleanup();
    }
  }
}

module.exports = EnhancedNeuroLintOrchestrator;
