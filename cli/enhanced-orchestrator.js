// Enhanced orchestrator that integrates all the patterns
const TransformationValidator = require('./orchestration/validator');
const ASTFallbackStrategy = require('./orchestration/ast-fallback');
const EnhancedSmartLayerSelector = require('./orchestration/enhanced-selector');
const LayerDependencyManager = require('./orchestration/dependencies');
const TransformationPipeline = require('./orchestration/pipeline');
const ErrorRecoverySystem = require('./orchestration/recovery');
const PerformanceOptimizer = require('./orchestration/performance');

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
      ...options
    };
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
   * Execute layers with comprehensive safety checks
   */
  async executeLayersWithSafetyChecks(code, layers, pipeline, analysis) {
    let current = code;
    const layerResults = [];
    const states = [code];
    let totalChanges = 0;
    
    // Define layer configurations
    const layerConfigs = this.getLayerConfigurations();
    
    for (const layerId of layers) {
      const layerConfig = layerConfigs[layerId];
      if (!layerConfig) {
        console.warn(`⚠️  Unknown layer: ${layerId}`);
        continue;
      }
      
      const layerStartTime = Date.now();
      const previous = current;
      
      if (this.options.verbose) {
        console.log(`🔧 Executing Layer ${layerId}: ${layerConfig.name}`);
      }
      
      try {
        // Step 1: Check if layer will make changes (performance optimization)
        if (this.options.useCache && !PerformanceOptimizer.shouldSkipLayer(current, layerId)) {
          if (this.options.verbose) {
            console.log(`⏭️  Skipping Layer ${layerId} (no changes needed)`);
          }
          
          layerResults.push({
            layerId,
            name: layerConfig.name,
            success: true,
            code: current,
            executionTime: Date.now() - layerStartTime,
            changeCount: 0,
            improvements: ['No changes needed'],
            skipped: true
          });
          continue;
        }
        
        // Step 2: Apply transformation with AST fallback strategy
        const transformed = await ASTFallbackStrategy.transformWithFallback(
          current, 
          layerConfig, 
          this.options
        );
        
        // Step 3: Incremental validation
        const validation = TransformationValidator.validateTransformation(previous, transformed);
        
        if (validation.shouldRevert) {
          console.warn(`🔙 Reverting Layer ${layerId}: ${validation.reason}`);
          
          layerResults.push({
            layerId,
            name: layerConfig.name,
            success: false,
            code: previous,
            executionTime: Date.now() - layerStartTime,
            changeCount: 0,
            revertReason: validation.reason,
            reverted: true
          });
          
          // Keep previous safe state
          current = previous;
          
        } else {
          // Accept transformation
          const changeCount = this.calculateChanges(previous, transformed);
          const improvements = this.detectImprovements(previous, transformed, layerId);
          
          current = this.options.dryRun ? previous : transformed;
          totalChanges += changeCount;
          
          layerResults.push({
            layerId,
            name: layerConfig.name,
            success: true,
            code: transformed,
            executionTime: Date.now() - layerStartTime,
            changeCount,
            improvements,
            usedAST: layerConfig.supportsAST
          });
          
          if (this.options.verbose) {
            console.log(`✅ Layer ${layerId} completed (${changeCount} changes)`);
            improvements.forEach(improvement => {
              console.log(`   • ${improvement}`);
            });
          }
        }
        
        states.push(current);
        pipeline.addTransformation(layerConfig.name, layerResults[layerResults.length - 1]);
        
      } catch (error) {
        const errorInfo = ErrorRecoverySystem.handleError(error, { layerId, code: current });
        
        layerResults.push({
          layerId,
          name: layerConfig.name,
          success: false,
          code: previous,
          executionTime: Date.now() - layerStartTime,
          changeCount: 0,
          error: errorInfo.message,
          errorCategory: errorInfo.category
        });
        
        console.error(`❌ Layer ${layerId} failed: ${errorInfo.message}`);
        
        if (this.options.failFast) {
          break;
        }
        
        // Continue with previous safe state
        current = previous;
      }
    }
    
    const successfulLayers = layerResults.filter(r => r.success && !r.skipped).length;
    const recommendations = this.generateRecommendations(layerResults, analysis);
    
    return {
      success: layerResults.length > 0 && successfulLayers > 0,
      finalCode: current,
      layerResults,
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
