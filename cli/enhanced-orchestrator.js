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
      ...options
    };
    
    // Initialize layer integrator to work with actual layer files
    this.layerIntegrator = new LayerIntegrator(options.projectRoot);
    
    // Validate that layer files exist
    const validation = this.layerIntegrator.validateLayerFiles();
    if (validation.missing.length > 0 && this.options.verbose) {
      console.warn(`⚠️  Missing layer files: ${validation.missing.join(', ')}`);
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
      const analysis = EnhancedSmartLayerSelector.analyzeAndRecommend(code, filePath);
      
      if (this.options.verbose) {
        console.log('🔍 Code Analysis Results:');
        console.log(`  Detected Issues: ${analysis.detectedIssues.length}`);
        console.log(`  Recommended Layers: ${analysis.recommendedLayers.join(', ')}`);
        console.log(`  Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
        console.log(`  Estimated Impact: ${analysis.estimatedImpact.level}`);
      }
      
      // Step 2: Layer Dependency Management
      const layerValidation = LayerDependencyManager.validateAndCorrectLayers(requestedLayers);
      
      if (layerValidation.warnings.length > 0 && this.options.verbose) {
        console.log('⚠️  Layer Dependency Warnings:');
        layerValidation.warnings.forEach(warning => console.log(`  ${warning}`));
      }
      
      const finalLayers = layerValidation.correctedLayers;
      
      // Step 3: Execute with Safe Layer Execution Pattern
      const result = await this.executeLayersWithSafetyChecks(
        code, 
        finalLayers, 
        pipeline,
        analysis
      );
      
      const totalTime = Date.now() - startTime;
      
      // Step 4: Generate comprehensive result
      return {
        success: result.success,
        finalCode: result.finalCode,
        originalCode: code,
        executedLayers: finalLayers,
        layerResults: result.layerResults,
        analysis,
        pipeline: pipeline.getReport(),
        performance: {
          totalExecutionTime: totalTime,
          layerExecutionTimes: result.layerResults.map(r => ({
            layerId: r.layerId,
            time: r.executionTime
          }))
        },
        recommendations: result.recommendations
      };
      
    } catch (error) {
      const errorInfo = ErrorRecoverySystem.handleError(error, { filePath, layers: requestedLayers });
      
      return {
        success: false,
        finalCode: code, // Return original on failure
        error: errorInfo,
        executedLayers: [],
        layerResults: [],
        performance: {
          totalExecutionTime: Date.now() - startTime
        }
      };
    }
  }
  
  /**
   * Execute layers with comprehensive safety checks using LayerIntegrator
   */
  async executeLayersWithSafetyChecks(code, layers, pipeline, analysis) {
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
          console.warn(`⚠️  Post-validation failed for Layer ${layerResult.layerId}: ${validation.reason}`);
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
            console.log(`✅ Layer ${layerResult.layerId} completed (${layerResult.changeCount} changes)`);
            (layerResult.improvements || []).forEach(improvement => {
              console.log(`   • ${improvement}`);
            });
          }
        }
        
        states.push(layerResult.code);
        pipeline.addTransformation(
          layerConfig?.name || `Layer ${layerResult.layerId}`, 
          layerResult
        );
      } else if (!layerResult.success) {
        console.error(`❌ Layer ${layerResult.layerId} failed: ${layerResult.error}`);
        
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
  }
  
  /**
   * Layer configurations with AST support flags
   */
  getLayerConfigurations() {
    return {
      1: {
        id: 1,
        name: 'Configuration Validation',
        description: 'Optimizes TypeScript, Next.js config, and package.json',
        supportsAST: false,
        regexTransform: async (code) => {
          // Import and use layer 1 processor
          const layer1 = require('../fix-layer-1-config');
          return await this.processLayer1(code);
        }
      },
      2: {
        id: 2,
        name: 'Pattern & Entity Fixes',
        description: 'Cleans up HTML entities, old patterns, and modernizes code',
        supportsAST: false,
        regexTransform: async (code) => {
          // Import and use layer 2 processor
          return await this.processLayer2(code);
        }
      },
      3: {
        id: 3,
        name: 'Component Best Practices',
        description: 'Fixes missing key props, accessibility, prop types, and imports',
        supportsAST: true,
        regexTransform: async (code) => {
          return await this.processLayer3(code);
        }
      },
      4: {
        id: 4,
        name: 'Hydration & SSR Guard',
        description: 'Fixes hydration bugs and adds SSR/localStorage protection',
        supportsAST: true,
        regexTransform: async (code) => {
          return await this.processLayer4(code);
        }
      }
    };
  }
  
  /**
   * Layer processors (simplified for CLI)
   */
  async processLayer1(code) {
    // Configuration layer processing
    let transformed = code;
    
    // TypeScript config upgrades
    if (code.includes('"target": "es5"')) {
      transformed = transformed.replace('"target": "es5"', '"target": "ES2022"');
    }
    
    if (code.includes('reactStrictMode: false')) {
      transformed = transformed.replace('reactStrictMode: false', 'reactStrictMode: true');
    }
    
    return transformed;
  }
  
  async processLayer2(code) {
    // Pattern and entity fixes
    let transformed = code;
    
    // HTML entity cleanup
    transformed = transformed.replace(/&quot;/g, '"');
    transformed = transformed.replace(/&amp;/g, '&');
    transformed = transformed.replace(/&lt;/g, '<');
    transformed = transformed.replace(/&gt;/g, '>');
    
    // Modernize variable declarations
    transformed = transformed.replace(/\bvar\s+/g, 'const ');
    
    return transformed;
  }
  
  async processLayer3(code) {
    // Component best practices
    let transformed = code;
    
    // Add missing keys to map functions
    transformed = transformed.replace(
      /\.map\s*\(\s*([^)]+)\s*=>\s*<([^>]+)(?![^>]*key=)/g,
      (match, mapArg, element) => {
        const keyVar = mapArg.includes(',') ? mapArg.split(',')[1].trim() : 'index';
        return match.replace(`<${element}`, `<${element} key={${keyVar}}`);
      }
    );
    
    return transformed;
  }
  
  async processLayer4(code) {
    // Hydration and SSR fixes
    let transformed = code;
    
    // Add SSR guards for localStorage
    transformed = transformed.replace(
      /localStorage\.(\w+)\s*\(/g,
      'typeof window !== "undefined" ? localStorage.$1('
    );
    
    return transformed;
  }
  
  /**
   * Calculate changes between code versions
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
    
    if (before === after) {
      return ['No changes detected'];
    }
    
    // Layer-specific improvement detection
    switch (layerId) {
      case 1:
        if (after.includes('"target": "ES2022"') && !before.includes('"target": "ES2022"')) {
          improvements.push('📊 Upgraded TypeScript target to ES2022');
        }
        if (after.includes('reactStrictMode: true') && !before.includes('reactStrictMode: true')) {
          improvements.push('⚛️ Enabled React Strict Mode');
        }
        break;
        
      case 2:
        if (after.split('&amp;').length < before.split('&amp;').length) {
          improvements.push('🔧 Fixed HTML entities');
        }
        if (after.includes('const ') && before.includes('var ')) {
          improvements.push('📦 Modernized variable declarations');
        }
        break;
        
      case 3:
        if (after.split('key=').length > before.split('key=').length) {
          improvements.push('🔑 Added missing React keys');
        }
        break;
        
      case 4:
        if (after.includes('typeof window') && !before.includes('typeof window')) {
          improvements.push('🔒 Added SSR safety checks');
        }
        break;
    }
    
    if (improvements.length === 0) {
      improvements.push('Code transformation applied');
    }
    
    return improvements;
  }
  
  /**
   * Generate final recommendations
   */
  generateRecommendations(layerResults, analysis) {
    const recommendations = [];
    const failedLayers = layerResults.filter(r => !r.success);
    const successfulLayers = layerResults.filter(r => r.success && !r.skipped);
    
    if (successfulLayers.length === 0) {
      recommendations.push('❌ No layers executed successfully. Consider running with --verbose for detailed error information.');
    } else {
      recommendations.push(`✅ ${successfulLayers.length} layers executed successfully.`);
    }
    
    if (failedLayers.length > 0) {
      recommendations.push(`⚠️  ${failedLayers.length} layers failed or were reverted.`);
      
      const revertedLayers = failedLayers.filter(r => r.reverted);
      if (revertedLayers.length > 0) {
        recommendations.push('🔙 Some transformations were reverted to prevent code corruption.');
      }
    }
    
    // Add specific recommendations based on remaining issues
    if (analysis.detectedIssues.length > 0) {
      const remainingCritical = analysis.detectedIssues.filter(i => i.severity === 'high').length;
      if (remainingCritical > 0) {
        recommendations.push(`🚨 ${remainingCritical} critical issues may still remain. Consider manual review.`);
      }
    }
    
    return recommendations;
  }
}

module.exports = EnhancedNeuroLintOrchestrator;
