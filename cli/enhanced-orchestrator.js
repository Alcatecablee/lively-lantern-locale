// Enhanced orchestrator that integrates all the patterns
const TransformationValidator = require('./orchestration/validator');
const ASTFallbackStrategy = require('./orchestration/ast-fallback');
const EnhancedSmartLayerSelector = require('./orchestration/enhanced-selector');
const LayerDependencyManager = require('./orchestration/dependencies');
const TransformationPipeline = require('./orchestration/pipeline');
const ErrorRecoverySystem = require('./orchestration/recovery');
const PerformanceOptimizer = require('./orchestration/performance');
const LayerIntegrator = require('./layer-integrator');

/**
 * Enhanced NeuroLint CLI Orchestrator following all orchestration patterns
 * Integrates safe execution, AST fallback, validation, and smart selection
 */
class EnhancedNeuroLintOrchestrator {
  
  constructor(options = {}) {
    this.options = {
      verbose: false,
      dryRun: false,
      useAST: true,
      useCache: true,
      failFast: false,
      createBackups: false,
      projectRoot: process.cwd(),
      ...options
    };
    
    // Initialize layer integrator to work with actual layer files
    this.layerIntegrator = new LayerIntegrator(this.options.projectRoot);
    
    // Validate that layer files exist
    const validation = this.layerIntegrator.validateLayerFiles();
    if (validation.missing.length > 0 && this.options.verbose) {
      console.warn(`WARNING: Missing layer files: ${validation.missing.join(', ')}`);
    }
  }
  
  /**
   * Main orchestration method following all patterns
   */
  async execute(code, filePath, requestedLayers = [1, 2, 3, 4]) {
    const startTime = Date.now();
    const pipeline = new TransformationPipeline(filePath || 'unknown');
    
    try {
      // Step 1: Smart Layer Selection
      const analysis = await this.performCodeAnalysis(code, filePath);
      
      if (this.options.verbose) {
        console.log('INFO: Code Analysis Results:');
        console.log(`  Detected Issues: ${analysis.detectedIssues ? analysis.detectedIssues.length : 0}`);
        console.log(`  Recommended Layers: ${analysis.recommendedLayers ? analysis.recommendedLayers.join(', ') : 'none'}`);
        console.log(`  Confidence: ${analysis.confidence ? (analysis.confidence * 100).toFixed(1) : 0}%`);
        console.log(`  Estimated Impact: ${analysis.estimatedImpact ? analysis.estimatedImpact.level : 'unknown'}`);
      }
      
      // Step 2: Layer Dependency Management
      const layerValidation = LayerDependencyManager.validateAndCorrectLayers(requestedLayers);
      
      if (layerValidation.warnings.length > 0 && this.options.verbose) {
        console.log('WARNING: Layer Dependency Issues:');
        layerValidation.warnings.forEach(warning => {
          console.log(`  ${warning}`);
        });
      }
      
      const finalLayers = layerValidation.correctedLayers;
      
      if (this.options.verbose) {
        console.log(`LAYERS: Executing ${finalLayers.join(', ')}`);
      }
      
      // Step 3: Execute layers with comprehensive safety checks
      const executionResult = await this.executeLayersWithSafetyChecks(
        code, 
        finalLayers, 
        pipeline, 
        analysis
      );
      
      // Step 4: Generate final result with recommendations
      const result = this.generateFinalResult(
        executionResult, 
        analysis, 
        startTime, 
        filePath
      );
      
      return result;
      
    } catch (error) {
      const errorInfo = ErrorRecoverySystem.categorizeError(error, 0, code);
      
      if (this.options.verbose) {
        console.error('ERROR: Orchestration failed:', errorInfo.message);
        console.error('CATEGORY:', errorInfo.category);
        console.error('SUGGESTION:', errorInfo.suggestion);
      }
      
      return {
        success: false,
        finalCode: code, // Return original on failure
        error: errorInfo,
        executedLayers: [],
        layerResults: [],
        summary: {
          totalExecutionTime: Date.now() - startTime,
          totalChanges: 0,
          successfulLayers: 0,
          failedLayers: 0
        }
      };
    }
  }
  
  /**
   * Perform comprehensive code analysis
   */
  async performCodeAnalysis(code, filePath) {
    try {
      return EnhancedSmartLayerSelector.analyzeAndRecommend(code, filePath);
    } catch (error) {
      if (this.options.verbose) {
        console.warn(`WARNING: Code analysis failed: ${error.message}`);
      }
      
      // Return minimal analysis on failure
      return {
        detectedIssues: [],
        recommendedLayers: [1, 2, 3, 4],
        confidence: 0.5,
        estimatedImpact: { level: 'unknown' }
      };
    }
  }
  
  /**
   * Execute layers with comprehensive safety checks using LayerIntegrator
   */
  async executeLayersWithSafetyChecks(code, layers, pipeline, analysis) {
    try {
      // Use LayerIntegrator to execute actual layer files
      const result = await this.layerIntegrator.executeLayers(layers, code, pipeline.filePath, {
        verbose: this.options.verbose,
        dryRun: this.options.dryRun,
        useAST: this.options.useAST,
        ignoreWarnings: false
      });
      
      const layerConfigs = this.getLayerConfigurations();
      let totalChanges = 0;
      const states = [code];
      
      // Apply additional validation and enhance results
      for (const layerResult of result.layerResults) {
        const layerConfig = layerConfigs[layerResult.layerId];
        
        if (layerResult.success && layerResult.code) {
          // Apply incremental validation for extra safety
          const validation = TransformationValidator.validateTransformation(
            code, 
            layerResult.code
          );
          
          if (validation.shouldRevert) {
            console.warn(`WARNING: Post-validation failed for Layer ${layerResult.layerId}: ${validation.reason}`);
            layerResult.success = false;
            layerResult.revertReason = validation.reason;
            layerResult.changeCount = 0;
            layerResult.reverted = true;
          } else {
            totalChanges += layerResult.changeCount || 0;
            
            // Enhance result with layer config info
            if (layerConfig) {
              layerResult.name = layerConfig.name;
              layerResult.usedAST = layerConfig.supportsAST;
            }
            
            if (this.options.verbose && layerResult.changeCount > 0) {
              console.log(`SUCCESS: Layer ${layerResult.layerId} completed (${layerResult.changeCount} changes)`);
              (layerResult.improvements || []).forEach(improvement => {
                console.log(`  ${improvement}`);
              });
            }
          }
          
          states.push(layerResult.code);
          
          // Add to pipeline if pipeline supports it
          if (pipeline.addTransformation) {
            pipeline.addTransformation(
              layerConfig?.name || `Layer ${layerResult.layerId}`, 
              layerResult
            );
          }
        } else if (!layerResult.success) {
          console.error(`ERROR: Layer ${layerResult.layerId} failed: ${layerResult.error}`);
          
          if (this.options.failFast) {
            break;
          }
        }
      }
      
      const successfulLayers = result.layerResults.filter(r => r.success).length;
      const recommendations = this.generateRecommendations(result.layerResults, analysis);
      
      return {
        success: result.layerResults.length > 0 && successfulLayers > 0,
        finalCode: result.finalCode,
        layerResults: result.layerResults,
        states,
        totalChanges,
        successfulLayers,
        recommendations
      };
      
    } catch (error) {
      console.error('ERROR: Layer execution failed:', error.message);
      return {
        success: false,
        finalCode: code,
        layerResults: [],
        states: [code],
        totalChanges: 0,
        successfulLayers: 0,
        recommendations: [`Execution failed: ${error.message}`]
      };
    }
  }
  
  /**
   * Generate final result with comprehensive summary
   */
  generateFinalResult(executionResult, analysis, startTime, filePath) {
    return {
      success: executionResult.success,
      finalCode: executionResult.finalCode,
      layerResults: executionResult.layerResults,
      states: executionResult.states,
      analysis,
      summary: {
        totalExecutionTime: Date.now() - startTime,
        totalChanges: executionResult.totalChanges,
        successfulLayers: executionResult.successfulLayers,
        failedLayers: executionResult.layerResults.length - executionResult.successfulLayers,
        filePath
      },
      recommendations: executionResult.recommendations,
      metadata: {
        timestamp: Date.now(),
        options: this.options,
        pipeline: filePath
      }
    };
  }
  
  /**
   * Layer configurations with AST support flags
   */
  getLayerConfigurations() {
    return {
      1: {
        id: 1,
        name: 'Configuration',
        description: 'TypeScript & Next.js configuration optimization',
        supportsAST: false,
        fileTypes: ['json', 'js']
      },
      2: {
        id: 2,
        name: 'Entity Cleanup',
        description: 'HTML entities and pattern fixes',
        supportsAST: false,
        fileTypes: ['ts', 'tsx', 'js', 'jsx']
      },
      3: {
        id: 3,
        name: 'Components',
        description: 'React component improvements',
        supportsAST: true,
        fileTypes: ['tsx', 'jsx']
      },
      4: {
        id: 4,
        name: 'Hydration',
        description: 'SSR safety and hydration fixes',
        supportsAST: true,
        fileTypes: ['ts', 'tsx', 'js', 'jsx']
      },
      5: {
        id: 5,
        name: 'Next.js',
        description: 'Next.js specific optimizations',
        supportsAST: true,
        fileTypes: ['ts', 'tsx', 'js', 'jsx']
      },
      6: {
        id: 6,
        name: 'Testing',
        description: 'Test setup and improvements',
        supportsAST: false,
        fileTypes: ['test.ts', 'test.tsx', 'spec.ts', 'spec.tsx']
      }
    };
  }
  
  /**
   * Individual layer processors (fallback implementations)
   */
  async processLayer1(code) {
    // Configuration layer fallback
    return code;
  }
  
  async processLayer2(code) {
    // Entity cleanup fallback
    return code.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }
  
  async processLayer3(code) {
    // Component fixes fallback
    return code;
  }
  
  async processLayer4(code) {
    // Hydration fixes fallback
    return code.replace(/localStorage\./g, 'typeof window !== "undefined" && localStorage.');
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
          if (before.includes('"target": "es5"') && after.includes('"target": "ES2020"')) {
            improvements.push('TypeScript target upgraded to ES2020');
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
      if (this.options.verbose) {
        console.warn(`WARNING: Could not detect improvements for layer ${layerId}: ${error.message}`);
      }
      improvements.push('Transformations applied');
    }
    
    return improvements;
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
}

module.exports = EnhancedNeuroLintOrchestrator;
