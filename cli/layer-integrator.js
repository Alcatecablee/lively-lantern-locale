const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

/**
 * Layer Integrator - Bridges CLI with actual sophisticated layer implementations
 * Uses your actual fix-master.js orchestrator and individual layer files
 */
class LayerIntegrator {
  constructor(options = {}) {
    this.options = {
      verbose: false,
      dryRun: false,
      timeout: 30000,
      ...options
    };
    
    // Path to actual layer files
    this.layersPath = path.resolve(__dirname, '../src/lib/neurolint/layers');
    this.tempDir = path.join(__dirname, 'temp');
    
    // Actual layer file mappings
    this.layerFiles = {
      1: path.join(this.layersPath, 'fix-layer-1-config.js'),
      2: path.join(this.layersPath, 'fix-layer-2-patterns.js'),
      3: path.join(this.layersPath, 'fix-layer-3-components.js'),
      4: path.join(this.layersPath, 'fix-layer-4-hydration.js'),
      5: path.join(this.layersPath, 'fix-layer-5-nextjs.js'),
      6: path.join(this.layersPath, 'fix-layer-6-testing.js')
    };
    
    // Your actual master orchestrator
    this.masterOrchestrator = path.join(this.layersPath, 'fix-master.js');
    
    this.ensureTempDirectory();
  }

  /**
   * Execute multiple layers using your sophisticated fix-master.js orchestrator
   */
  async executeMultipleLayers(code, filePath, layerIds, options = {}) {
    const results = {
      success: true,
      layerResults: [],
      finalCode: code,
      summary: {
        totalChanges: 0,
        executedLayers: []
      },
      performance: {
        startTime: Date.now(),
        totalExecutionTime: 0
      }
    };

    try {
      // Validate layer files exist
      const validation = this.validateLayerFiles(layerIds);
      if (validation.missing.length > 0) {
        console.warn(`WARNING: Missing layer files for layers: ${validation.missing.join(', ')}`);
      }

      // For multiple layers, prefer using your master orchestrator
      if (layerIds.length > 1 && fs.existsSync(this.masterOrchestrator)) {
        console.log('INFO: Using sophisticated master orchestrator for multi-layer execution...');
        
        const masterResult = await this.executeMasterOrchestrator(code, filePath, layerIds, options);
        return masterResult;
      }

      // Fallback to individual layer execution
      let currentCode = code;
      
      // Execute each layer in sequence
      for (const layerId of layerIds) {
        try {
          console.log(`INFO: Executing Layer ${layerId}...`);
          
          const layerResult = await this.runSingleLayer(
            currentCode, 
            filePath, 
            layerId, 
            { ...options, ...this.options }
          );

          if (layerResult.success) {
            // Update code with layer result
            currentCode = layerResult.transformedCode || currentCode;
            
            // Calculate changes
            const changes = this.calculateChanges(
              layerResult.originalCode || code, 
              layerResult.transformedCode || currentCode
            );
            
            const layerTime = Date.now() - layerResult.startTime;
            
            // Detect improvements
            const improvements = this.detectImprovements(
              layerResult.originalCode || code,
              layerResult.transformedCode || currentCode,
              layerId
            );

            console.log(`SUCCESS: Applied ${changes} changes (${layerTime}ms)`);
            
            results.layerResults.push({
              layerId,
              name: this.getLayerName(layerId),
              success: true,
              changeCount: changes,
              improvements,
              executionTime: layerTime,
              transformedCode: layerResult.transformedCode
            });
            
            results.summary.totalChanges += changes;
            results.summary.executedLayers.push(layerId);
            
          } else {
            // Layer failed, but continue with other layers
            console.log(`WARNING: Layer ${layerId} transformation reverted due to validation failure`);
            
            results.layerResults.push({
              layerId,
              name: this.getLayerName(layerId),
              success: false,
              error: layerResult.error,
              revertReason: 'Validation failed',
              changeCount: 0
            });
          }
          
        } catch (error) {
          console.log(`ERROR: Layer ${layerId} failed: ${error.message}`);
          
          results.layerResults.push({
            layerId,
            name: this.getLayerName(layerId),
            success: false,
            error: error.message,
            changeCount: 0
          });
          
          // Continue with other layers unless fail-fast is enabled
          if (options.failFast) {
            results.success = false;
            break;
          }
        }
      }

      results.finalCode = currentCode;
      results.performance.totalExecutionTime = Date.now() - results.performance.startTime;
      
      return results;
      
    } catch (error) {
      results.success = false;
      results.error = error.message;
      return results;
    }
  }

  /**
   * Execute using your sophisticated fix-master.js orchestrator
   */
  async executeMasterOrchestrator(code, filePath, layerIds, options = {}) {
    const results = {
      success: true,
      layerResults: [],
      finalCode: code,
      summary: {
        totalChanges: 0,
        executedLayers: []
      },
      performance: {
        startTime: Date.now(),
        totalExecutionTime: 0
      }
    };

    try {
      // Create temporary file for processing
      const tempFile = path.join(this.tempDir, `master-${Date.now()}.js`);
      fs.writeFileSync(tempFile, code);

      // Change to layers directory for proper execution
      const originalCwd = process.cwd();
      process.chdir(this.layersPath);

      // Import and execute your master orchestrator
      const MasterOrchestrator = require(this.masterOrchestrator);
      const orchestrator = new MasterOrchestrator({
        verbose: options.verbose || this.options.verbose,
        failFast: options.failFast || false,
        validateEach: true,
        generateReport: false, // We'll handle reporting in CLI
        targetFile: tempFile,
        requestedLayers: layerIds
      });

      console.log('INFO: Executing sophisticated master orchestrator...');
      const masterReport = await orchestrator.executeAllLayers();

      // Restore working directory
      process.chdir(originalCwd);

      // Read the transformed code
      const transformedCode = fs.existsSync(tempFile) ? 
        fs.readFileSync(tempFile, 'utf8') : code;

      // Convert master orchestrator results to our format
      results.finalCode = transformedCode;
      results.summary.totalChanges = masterReport.totalChanges || 0;
      results.summary.executedLayers = masterReport.layers
        .filter(l => l.success)
        .map(l => l.id);

      results.layerResults = masterReport.layers.map(layer => ({
        layerId: layer.id,
        name: layer.name,
        success: layer.success,
        changeCount: layer.changes || 0,
        executionTime: layer.executionTime || 0,
        error: layer.errors.length > 0 ? layer.errors[0] : null,
        improvements: this.detectImprovements(code, transformedCode, layer.id),
        transformedCode: layer.success ? transformedCode : code
      }));

      results.performance.totalExecutionTime = Date.now() - results.performance.startTime;
      results.success = masterReport.errors.length === 0;

      // Clean up temp file
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch (cleanupError) {
        console.warn(`WARNING: Could not remove temp file: ${cleanupError.message}`);
      }

      console.log(`SUCCESS: Master orchestrator completed with ${results.summary.totalChanges} total changes`);
      
      return results;

    } catch (error) {
      process.chdir(originalCwd);
      console.error(`ERROR: Master orchestrator failed: ${error.message}`);
      
      results.success = false;
      results.error = error.message;
      return results;
    }
  }

  /**
   * Run a single layer using the actual sophisticated implementation
   */
  async runSingleLayer(code, filePath, layerId, options = {}) {
    const startTime = Date.now();
    
    try {
      const layerFile = this.layerFiles[layerId];
      
      if (!layerFile || !fs.existsSync(layerFile)) {
        throw new Error(`Layer ${layerId} file not found: ${layerFile}`);
      }

      // Create temporary file for the layer to process
      const tempFile = path.join(this.tempDir, `temp-${Date.now()}-${layerId}.js`);
      fs.writeFileSync(tempFile, code);

      let result;
      
      try {
        // Try to execute the layer as a module first
        result = await this.executeLayerAsModule(layerFile, tempFile, code, options);
      } catch (moduleError) {
        console.warn(`WARNING: Module execution failed for Layer ${layerId}, trying script execution: ${moduleError.message}`);
        
        // Fallback to script execution
        result = await this.executeLayerAsScript(layerFile, tempFile, code, options);
      }

      // Validate the transformation
      const validation = this.validateTransformation(code, result.transformedCode, layerId);
      
      if (!validation.valid) {
        return {
          success: false,
          error: validation.reason,
          originalCode: code,
          transformedCode: code, // Return original on validation failure
          startTime
        };
      }

      return {
        success: true,
        originalCode: code,
        transformedCode: result.transformedCode,
        changes: result.changes || 0,
        startTime,
        executionTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalCode: code,
        transformedCode: code,
        startTime
      };
    }
  }

  /**
   * Execute layer as a Node.js module
   */
  async executeLayerAsModule(layerFile, tempFile, code, options) {
    return new Promise((resolve, reject) => {
      try {
        // Change to the layer directory to ensure relative paths work
        const originalCwd = process.cwd();
        process.chdir(this.layersPath);
        
        // Execute the layer file
        const child = spawn('node', [layerFile], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: this.options.timeout,
          env: {
            ...process.env,
            NEUROLINT_TARGET_FILE: tempFile,
            NEUROLINT_DRY_RUN: options.dryRun ? 'true' : 'false',
            NEUROLINT_VERBOSE: options.verbose ? 'true' : 'false'
          }
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          process.chdir(originalCwd);
          
          if (code !== 0) {
            if (stderr.trim()) {
              console.warn(`WARNING: Layer ${layerId} stderr: ${stderr.trim()}`);
            }
            reject(new Error(`Layer execution failed with code ${code}`));
            return;
          }

          try {
            // Read the transformed file
            const transformedCode = fs.existsSync(tempFile) ? 
              fs.readFileSync(tempFile, 'utf8') : code;
            
            resolve({
              transformedCode,
              stdout,
              stderr
            });
          } catch (readError) {
            reject(new Error(`Failed to read transformed file: ${readError.message}`));
          }
        });

        child.on('error', (error) => {
          process.chdir(originalCwd);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Execute layer as a script (fallback method)
   */
  async executeLayerAsScript(layerFile, tempFile, code, options) {
    return new Promise((resolve, reject) => {
      try {
        const originalCwd = process.cwd();
        process.chdir(this.layersPath);
        
        const result = execSync(`node "${layerFile}"`, {
          timeout: this.options.timeout,
          env: {
            ...process.env,
            NEUROLINT_TARGET_FILE: tempFile,
            NEUROLINT_DRY_RUN: options.dryRun ? 'true' : 'false',
            NEUROLINT_VERBOSE: options.verbose ? 'true' : 'false'
          }
        });

        process.chdir(originalCwd);
        
        const transformedCode = fs.existsSync(tempFile) ? 
          fs.readFileSync(tempFile, 'utf8') : code;
        
        resolve({
          transformedCode,
          stdout: result.toString()
        });
        
      } catch (error) {
        process.chdir(originalCwd);
        reject(error);
      } finally {
        // Clean up temp file
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (cleanupError) {
          console.warn(`WARNING: Could not remove temp file ${tempFile}: ${cleanupError.message}`);
        }
      }
    });
  }

  /**
   * Validate layer files exist
   */
  validateLayerFiles(layerIds) {
    const missing = [];
    const available = [];
    
    layerIds.forEach(layerId => {
      const layerFile = this.layerFiles[layerId];
      if (!layerFile || !fs.existsSync(layerFile)) {
        missing.push(layerId);
      } else {
        available.push(layerId);
      }
    });
    
    return { missing, available };
  }

  /**
   * Validate transformation result
   */
  validateTransformation(original, transformed, layerId) {
    try {
      // Basic validation
      if (typeof transformed !== 'string') {
        return { valid: false, reason: 'Transformation result is not a string' };
      }
      
      if (transformed.length === 0 && original.length > 0) {
        return { valid: false, reason: 'Transformation resulted in empty file' };
      }
      
      // Check for basic syntax corruption
      if (this.hasSyntaxErrors(transformed)) {
        return { valid: false, reason: 'Transformation introduced syntax errors' };
      }
      
      return { valid: true };
      
    } catch (error) {
      console.warn(`WARNING: Transformation validation error: ${error.message}`);
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Check for basic syntax errors
   */
  hasSyntaxErrors(code) {
    try {
      // Basic quote balance check
      const singleQuotes = (code.match(/'/g) || []).length;
      const doubleQuotes = (code.match(/"/g) || []).length;
      const backticks = (code.match(/`/g) || []).length;
      
      return (singleQuotes % 2 !== 0) || (doubleQuotes % 2 !== 0) || (backticks % 2 !== 0);
    } catch (error) {
      return true;
    }
  }

  /**
   * Calculate changes between original and transformed code
   */
  calculateChanges(original, transformed) {
    try {
      if (original === transformed) return 0;
      
      const originalLines = original.split('\n');
      const transformedLines = transformed.split('\n');
      
      let changes = Math.abs(originalLines.length - transformedLines.length);
      
      const minLength = Math.min(originalLines.length, transformedLines.length);
      for (let i = 0; i < minLength; i++) {
        if (originalLines[i] !== transformedLines[i]) {
          changes++;
        }
      }
      
      return changes;
    } catch (error) {
      console.warn(`WARNING: Could not calculate changes: ${error.message}`);
      return 0;
    }
  }

  /**
   * Detect improvements made by each layer
   */
  detectImprovements(original, transformed, layerId) {
    const improvements = [];
    
    try {
      if (original === transformed) {
        return ['No changes needed'];
      }
      
      // Layer-specific improvement detection
      switch (layerId) {
        case 1:
          if (transformed.includes('"target": "ES2020"')) improvements.push('Upgraded TypeScript target');
          if (transformed.includes('"strict": true')) improvements.push('Enabled TypeScript strict mode');
          break;
        case 2:
          if (transformed.split('&quot;').length < original.split('&quot;').length) improvements.push('Fixed HTML entities');
          if (transformed.split('import').length < original.split('import').length) improvements.push('Removed unused imports');
          break;
        case 3:
          if (transformed.split('key=').length > original.split('key=').length) improvements.push('Added missing React keys');
          if (transformed.split('variant=').length > original.split('variant=').length) improvements.push('Added component variants');
          break;
        case 4:
          if (transformed.includes('typeof window')) improvements.push('Added SSR guards');
          if (transformed.includes('mounted')) improvements.push('Added hydration safety');
          break;
        case 5:
          if (transformed.includes("'use client'")) improvements.push('Fixed Next.js client components');
          if (transformed.includes('next/')) improvements.push('Optimized Next.js imports');
          break;
        case 6:
          if (transformed.includes('React.memo')) improvements.push('Added React.memo optimization');
          if (transformed.includes('ErrorBoundary')) improvements.push('Added error boundaries');
          break;
      }
      
      // General improvements
      const originalConsoleCount = (original.match(/console\.log/g) || []).length;
      const transformedConsoleCount = (transformed.match(/console\.log/g) || []).length;
      if (transformedConsoleCount < originalConsoleCount) {
        improvements.push(`${originalConsoleCount - transformedConsoleCount} console.log statements optimized`);
      }
      
      return improvements.length > 0 ? improvements : ['Code transformation applied'];
      
    } catch (error) {
      console.warn(`WARNING: Could not detect improvements for layer ${layerId}: ${error.message}`);
      return ['Code transformation applied'];
    }
  }

  /**
   * Get layer name
   */
  getLayerName(layerId) {
    const names = {
      1: 'Configuration Fixes',
      2: 'Pattern Fixes', 
      3: 'Component Fixes',
      4: 'Hydration Fixes',
      5: 'Next.js Fixes',
      6: 'Testing Fixes'
    };
    return names[layerId] || `Layer ${layerId}`;
  }

  /**
   * Ensure temp directory exists
   */
  ensureTempDirectory() {
    try {
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
      }
    } catch (error) {
      console.warn(`WARNING: Could not create temp directory: ${error.message}`);
    }
  }

  /**
   * Clean up temporary files
   */
  cleanup() {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        files.forEach(file => {
          const filePath = path.join(this.tempDir, file);
          try {
            fs.unlinkSync(filePath);
          } catch (error) {
            console.warn(`WARNING: Could not remove temp file ${filePath}: ${error.message}`);
          }
        });
        
        fs.rmdirSync(this.tempDir);
      }
    } catch (error) {
      console.warn(`WARNING: Could not remove temp directory ${this.tempDir}: ${error.message}`);
    }
  }

  /**
   * Cleanup on process exit
   */
  setupCleanup() {
    process.on('exit', () => this.cleanup());
    process.on('SIGINT', () => {
      this.cleanup();
      process.exit(0);
    });
  }
}

module.exports = LayerIntegrator;