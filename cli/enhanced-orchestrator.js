const fs = require('fs');
const path = require('path');

// Import orchestration components
const LayerIntegrator = require('./layer-integrator');
const EnhancedSmartLayerSelector = require('./orchestration/enhanced-selector');
const LayerDependencyManager = require('./orchestration/dependencies');
const ErrorRecoverySystem = require('./orchestration/recovery');
const ASTFallbackManager = require('./orchestration/ast-fallback');

/**
 * Enhanced NeuroLint Orchestrator - Enterprise-grade orchestration system
 * Integrates with your actual sophisticated layer implementations
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
   * Execute the sophisticated multi-layer orchestration
   */
  async execute(code, filePath, requestedLayers = [1, 2, 3, 4]) {
    this.performance.startTime = Date.now();
    
    try {
      // Validate and auto-correct layer selection using dependency manager
      const layerValidation = LayerDependencyManager.validateAndCorrectLayers(requestedLayers);
      
      if (layerValidation.warnings.length > 0) {
        console.log('WARNING: Layer Dependency Issues:');
        layerValidation.warnings.forEach(warning => {
          console.log(`  ${warning}`);
        });
      }
      
      const finalLayers = layerValidation.correctedLayers;
      
      // Analyze code for smart recommendations
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

      // Execute layers using the actual sophisticated implementations
      const executionResult = await this.layerIntegrator.executeMultipleLayers(
        code, 
        filePath, 
        finalLayers, 
        this.options
      );

      // Post-execution validation and error recovery
      const validationResults = await this.validateExecutionResults(executionResult, code);
      
      // Generate comprehensive result
      const result = {
        success: executionResult.success,
        originalCode: code,
        finalCode: executionResult.finalCode,
        executedLayers: executionResult.summary.executedLayers,
        layerResults: this.enrichLayerResults(executionResult.layerResults),
        analysis: analysis,
        validation: validationResults,
        performance: this.generatePerformanceReport(executionResult),
        summary: {
          totalChanges: executionResult.summary.totalChanges,
          executedLayers: executionResult.summary.executedLayers,
          failedLayers: executionResult.layerResults.filter(r => !r.success).length,
          executionTime: executionResult.performance.totalExecutionTime
        },
        recommendations: this.generateRecommendations(executionResult, analysis),
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
        performance: this.generatePerformanceReport({ performance: { totalExecutionTime: 0 } }),
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
   * Validate execution results and apply error recovery if needed
   */
  async validateExecutionResults(executionResult, originalCode) {
    const validationResults = {
      codeIntegrity: true,
      layerConsistency: true,
      performanceAcceptable: true,
      issues: [],
      warnings: []
    };

    try {
      // Validate code integrity
      if (!executionResult.finalCode || typeof executionResult.finalCode !== 'string') {
        validationResults.codeIntegrity = false;
        validationResults.issues.push('Final code is invalid or missing');
      }

      // Validate layer consistency
      executionResult.layerResults.forEach(layerResult => {
        if (layerResult.success) {
          const validation = this.validateLayerResult(layerResult, originalCode);
          if (!validation.valid) {
            validationResults.layerConsistency = false;
            validationResults.issues.push(`Layer ${layerResult.layerId} validation failed: ${validation.reason}`);
            
            // Mark layer as reverted
            layerResult.success = false;
            layerResult.reverted = true;
            layerResult.revertReason = validation.reason;
            
            console.warn(`WARNING: Post-validation failed for Layer ${layerResult.layerId}: ${validation.reason}`);
          }
        }
      });

      // Validate performance
      if (executionResult.performance.totalExecutionTime > 60000) { // 60 seconds
        validationResults.performanceAcceptable = false;
        validationResults.warnings.push('Execution time exceeded 60 seconds');
      }

      return validationResults;

    } catch (error) {
      validationResults.codeIntegrity = false;
      validationResults.issues.push(`Validation error: ${error.message}`);
      return validationResults;
    }
  }

  /**
   * Validate individual layer result
   */
  validateLayerResult(layerResult, originalCode) {
    try {
      if (!layerResult.transformedCode) {
        return { valid: false, reason: 'No transformed code provided' };
      }

      // Log successful layer completion
      console.log(`SUCCESS: Layer ${layerResult.layerId} completed (${layerResult.changeCount} changes)`);
      if (layerResult.improvements && layerResult.improvements.length > 0) {
        layerResult.improvements.forEach(improvement => {
          console.log(`  ${improvement}`);
        });
      }

      return { valid: true };

    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Handle layer execution errors with recovery
   */
  async handleLayerError(layerId, error, code, filePath) {
    console.error(`ERROR: Layer ${layerId} failed: ${error.message}`);
    
    // Attempt error recovery
    const recoveryResult = await this.errorRecovery.recoverFromLayerError(
      layerId, 
      error, 
      code, 
      filePath
    );
    
    if (recoveryResult.recovered) {
      console.log(`INFO: Layer ${layerId} recovered using: ${recoveryResult.method}`);
      return recoveryResult.result;
    }
    
    // Return original code if recovery fails
    return {
      success: false,
      error: error.message,
      originalCode: code,
      transformedCode: code
    };
  }

  /**
   * Execute layers with comprehensive error handling
   */
  async executeLayersWithErrorHandling(code, filePath, layers) {
    const results = [];
    let currentCode = code;
    
    for (const layerId of layers) {
      const layerStartTime = Date.now();
      
      try {
        const layerResult = await this.layerIntegrator.runSingleLayer(
          currentCode,
          filePath,
          layerId,
          this.options
        );
        
        if (layerResult.success) {
          currentCode = layerResult.transformedCode;
          results.push({
            ...layerResult,
            layerId,
            executionTime: Date.now() - layerStartTime
          });
        } else {
          // Handle layer failure
          const errorResult = await this.handleLayerError(layerId, layerResult.error, currentCode, filePath);
          results.push({
            ...errorResult,
            layerId,
            executionTime: Date.now() - layerStartTime
          });
        }
        
      } catch (error) {
        console.error('ERROR: Layer execution failed:', error.message);
        const errorResult = await this.handleLayerError(layerId, error, currentCode, filePath);
        results.push({
          ...errorResult,
          layerId,
          executionTime: Date.now() - layerStartTime
        });
      }
    }
    
    return {
      finalCode: currentCode,
      layerResults: results,
      success: results.some(r => r.success)
    };
  }

  /**
   * Enrich layer results with additional metadata
   */
  enrichLayerResults(layerResults) {
    return layerResults.map(result => {
      const layerInfo = LayerDependencyManager.getLayerInfo(result.layerId);
      
      return {
        ...result,
        layerInfo,
        timestamp: new Date().toISOString(),
        validated: true
      };
    });
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(executionResult) {
    const totalTime = executionResult.performance?.totalExecutionTime || 0;
    
    return {
      totalExecutionTime: totalTime,
      averageLayerTime: totalTime / (executionResult.layerResults?.length || 1),
      layerBreakdown: executionResult.layerResults?.map(r => ({
        layerId: r.layerId,
        executionTime: r.executionTime || 0,
        changeCount: r.changeCount || 0,
        efficiency: (r.changeCount || 0) / Math.max(r.executionTime || 1, 1) * 1000 // changes per second
      })) || [],
      cachePerformance: {
        hits: this.performance.cacheHits,
        misses: this.performance.cacheMisses,
        hitRate: this.performance.cacheHits / Math.max(this.performance.cacheHits + this.performance.cacheMisses, 1)
      }
    };
  }

  /**
   * Generate recommendations based on execution results
   */
  generateRecommendations(executionResult, analysis) {
    const recommendations = [];
    
    try {
      // Performance recommendations
      if (executionResult.performance.totalExecutionTime > 30000) {
        recommendations.push('Consider enabling caching for better performance');
      }
      
      // Layer-specific recommendations
      const failedLayers = executionResult.layerResults.filter(r => !r.success);
      if (failedLayers.length > 0) {
        recommendations.push(`Review failed layers: ${failedLayers.map(l => l.layerId).join(', ')}`);
      }
      
      // Code quality recommendations
      if (analysis.confidence && analysis.confidence < 0.7) {
        recommendations.push('Consider manual review due to low confidence score');
      }
      
      // Optimization recommendations
      const lowEfficiencyLayers = executionResult.layerResults.filter(r => 
        r.executionTime > 5000 && r.changeCount < 5
      );
      if (lowEfficiencyLayers.length > 0) {
        recommendations.push('Some layers had low efficiency - consider optimization');
      }
      
      return recommendations;
      
    } catch (error) {
      console.warn(`WARNING: Recommendation generation failed: ${error.message}`);
      return ['Review execution results manually'];
    }
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
