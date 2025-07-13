const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Layer Integrator - Bridges CLI with actual layer implementations
 * Executes the individual layer files located in src/lib/neurolint/layers/
 * Follows orchestration patterns for safety and error recovery
 */
class LayerIntegrator {
  
  constructor(projectRoot) {
    this.projectRoot = projectRoot || process.cwd();
    this.layersPath = path.join(this.projectRoot, 'src', 'lib', 'neurolint', 'layers');
    this.layerFiles = {
      1: 'fix-layer-1-config.js',
      2: 'fix-layer-2-patterns.js', 
      3: 'fix-layer-3-components.js',
      4: 'fix-layer-4-hydration.js',
      5: 'fix-layer-5-nextjs.js',
      6: 'fix-layer-6-testing.js'
    };
    
    // Initialize temp directory for safe execution
    this.tempDir = path.join(this.projectRoot, '.neurolint-temp');
    this.ensureTempDirectory();
  }

  /**
   * Ensure temp directory exists for safe file operations
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
   * Check if all layer files exist and validate their integrity
   */
  validateLayerFiles() {
    const missing = [];
    const existing = [];
    const invalid = [];
    
    Object.entries(this.layerFiles).forEach(([layerId, filename]) => {
      const fullPath = path.join(this.layersPath, filename);
      
      if (fs.existsSync(fullPath)) {
        try {
          // Basic validation - check if file is readable and has content
          const stats = fs.statSync(fullPath);
          if (stats.size === 0) {
            invalid.push({ layerId: parseInt(layerId), reason: 'Empty file' });
          } else {
            existing.push(parseInt(layerId));
          }
        } catch (error) {
          invalid.push({ layerId: parseInt(layerId), reason: error.message });
        }
      } else {
        missing.push(parseInt(layerId));
      }
    });
    
    return { existing, missing, invalid };
  }

  /**
   * Execute a specific layer on code with comprehensive error handling
   */
  async executeLayer(layerId, code, filePath, options = {}) {
    const layerFile = this.layerFiles[layerId];
    if (!layerFile) {
      throw new Error(`Unknown layer: ${layerId}`);
    }
    
    const layerPath = path.join(this.layersPath, layerFile);
    if (!fs.existsSync(layerPath)) {
      throw new Error(`Layer file not found: ${layerPath}`);
    }
    
    const startTime = Date.now();
    
    try {
      // Attempt module-based execution first
      const result = await this.executeLayerAsModule(layerId, code, filePath, options);
      
      return {
        ...result,
        executionTime: Date.now() - startTime,
        method: 'module'
      };
      
    } catch (moduleError) {
      if (options.verbose) {
        console.warn(`WARNING: Module execution failed for Layer ${layerId}, trying script execution: ${moduleError.message}`);
      }
      
      try {
        // Fallback to script execution
        const result = await this.executeLayerAsScript(layerId, code, filePath, options);
        
        return {
          ...result,
          executionTime: Date.now() - startTime,
          method: 'script'
        };
        
      } catch (scriptError) {
        throw new Error(`Layer ${layerId} execution failed: Module error: ${moduleError.message}, Script error: ${scriptError.message}`);
      }
    }
  }
  
  /**
   * Execute layer as Node.js module (preferred method)
   */
  async executeLayerAsModule(layerId, code, filePath, options = {}) {
    const layerFile = this.layerFiles[layerId];
    const layerPath = path.join(this.layersPath, layerFile);
    
    try {
      // Clear module cache to ensure fresh execution
      delete require.cache[require.resolve(layerPath)];
      const layerModule = require(layerPath);
      
      // Try different export patterns
      if (typeof layerModule === 'function') {
        const result = await layerModule(code, filePath, options);
        return this.normalizeLayerResult(result, code);
        
      } else if (layerModule.process && typeof layerModule.process === 'function') {
        const result = await layerModule.process(code, filePath, options);
        return this.normalizeLayerResult(result, code);
        
      } else if (layerModule.execute && typeof layerModule.execute === 'function') {
        const result = await layerModule.execute(code, filePath, options);
        return this.normalizeLayerResult(result, code);
        
      } else if (layerModule.default && typeof layerModule.default === 'function') {
        const result = await layerModule.default(code, filePath, options);
        return this.normalizeLayerResult(result, code);
        
      } else {
        throw new Error('Layer module does not export a valid function');
      }
      
    } catch (error) {
      throw new Error(`Module execution failed: ${error.message}`);
    }
  }
  
  /**
   * Execute layer as external script (fallback method)
   */
  async executeLayerAsScript(layerId, code, filePath, options = {}) {
    const layerFile = this.layerFiles[layerId];
    const layerPath = path.join(this.layersPath, layerFile);
    
    // Create temporary file with the code
    const tempFile = path.join(this.tempDir, `temp-${layerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.js`);
    
    try {
      fs.writeFileSync(tempFile, code, 'utf8');
      
      // Execute the layer script with timeout and proper error handling
      const command = `node "${layerPath}" "${tempFile}"`;
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectRoot,
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      // Handle warnings from stderr
      if (stderr && !options.ignoreWarnings) {
        console.warn(`WARNING: Layer ${layerId} stderr: ${stderr.trim()}`);
      }
      
      // Read the transformed code
      let transformedCode;
      try {
        transformedCode = fs.readFileSync(tempFile, 'utf8');
      } catch (readError) {
        throw new Error(`Could not read transformed file: ${readError.message}`);
      }
      
      return {
        code: transformedCode,
        changes: this.calculateChanges(code, transformedCode),
        output: stdout ? stdout.trim() : '',
        warnings: stderr ? stderr.trim() : ''
      };
      
    } catch (error) {
      if (error.code === 'TIMEOUT') {
        throw new Error(`Layer execution timed out after 30 seconds`);
      } else if (error.code === 'MAXBUFFER') {
        throw new Error(`Layer output exceeded buffer limit`);
      } else {
        throw new Error(`Script execution failed: ${error.message}`);
      }
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
  }
  
  /**
   * Normalize layer result to consistent format
   */
  normalizeLayerResult(result, originalCode) {
    if (typeof result === 'string') {
      return {
        code: result,
        changes: this.calculateChanges(originalCode, result),
        output: '',
        warnings: ''
      };
    } else if (result && typeof result === 'object') {
      return {
        code: result.code || result.transformed || originalCode,
        changes: result.changes || this.calculateChanges(originalCode, result.code || result.transformed || originalCode),
        output: result.output || result.log || '',
        warnings: result.warnings || result.stderr || ''
      };
    } else {
      return {
        code: originalCode,
        changes: 0,
        output: '',
        warnings: 'Layer returned unexpected result type'
      };
    }
  }
  
  /**
   * Execute multiple layers in sequence with comprehensive error handling
   */
  async executeLayers(layerIds, code, filePath, options = {}) {
    let current = code;
    const results = [];
    const startTime = Date.now();
    const states = [code]; // Track all code states for rollback
    
    // Validate layers exist before starting
    const validation = this.validateLayerFiles();
    const missingLayers = layerIds.filter(id => validation.missing.includes(id));
    
    if (missingLayers.length > 0) {
      console.warn(`WARNING: Missing layer files for layers: ${missingLayers.join(', ')}`);
    }
    
    // Execute available layers only
    const availableLayers = layerIds.filter(id => validation.existing.includes(id));
    
    for (const layerId of availableLayers) {
      const layerStart = Date.now();
      const previous = current;
      
      try {
        if (options.verbose) {
          console.log(`INFO: Executing Layer ${layerId}...`);
        }
        
        const result = await this.executeLayer(layerId, current, filePath, options);
        
        // Extract transformed code from result
        if (typeof result === 'string') {
          current = result;
        } else if (result && result.code) {
          current = result.code;
        } else {
          throw new Error('Layer returned invalid result format');
        }
        
        const layerTime = Date.now() - layerStart;
        const changes = this.calculateChanges(previous, current);
        
        // Validate transformation before accepting
        if (this.isValidTransformation(previous, current)) {
          states.push(current);
          
          results.push({
            layerId,
            success: true,
            executionTime: layerTime,
            changeCount: changes,
            improvements: this.detectImprovements(previous, current, layerId),
            code: current,
            method: result.method || 'unknown',
            output: result.output || '',
            warnings: result.warnings || ''
          });
          
          if (options.verbose && changes > 0) {
            console.log(`SUCCESS: Applied ${changes} changes (${layerTime}ms)`);
          }
        } else {
          // Revert to previous state on invalid transformation
          current = previous;
          
          results.push({
            layerId,
            success: false,
            executionTime: layerTime,
            changeCount: 0,
            error: 'Transformation validation failed',
            code: previous,
            reverted: true
          });
          
          if (options.verbose) {
            console.log(`WARNING: Layer ${layerId} transformation reverted due to validation failure`);
          }
        }
        
      } catch (error) {
        results.push({
          layerId,
          success: false,
          executionTime: Date.now() - layerStart,
          error: error.message,
          code: previous, // Keep previous code on error
          changeCount: 0
        });
        
        if (options.verbose) {
          console.log(`ERROR: Layer ${layerId} failed: ${error.message}`);
        }
        
        // Continue with previous code
        current = previous;
      }
    }
    
    // Handle missing layers
    for (const layerId of missingLayers) {
      results.push({
        layerId,
        success: false,
        executionTime: 0,
        error: 'Layer file not found',
        code: current,
        changeCount: 0,
        missing: true
      });
    }
    
    return {
      finalCode: current,
      layerResults: results,
      states,
      summary: {
        totalExecutionTime: Date.now() - startTime,
        totalChanges: results.reduce((sum, r) => sum + (r.changeCount || 0), 0),
        successfulLayers: results.filter(r => r.success).length,
        failedLayers: results.filter(r => !r.success).length,
        revertedLayers: results.filter(r => r.reverted).length
      }
    };
  }
  
  /**
   * Validate transformation is safe and doesn't corrupt code
   */
  isValidTransformation(before, after) {
    if (before === after) return true;
    
    // Basic validation checks
    try {
      // Check for basic syntax corruption patterns
      const corruptionPatterns = [
        /function\s*\(\s*\)\s*=>\s*\(\s*\)\s*=>/,  // Double arrow functions
        /import\s*{\s*}\s*from\s*from/,              // Duplicate imports
        /\(\s*\)\s*\(\s*\)/,                        // Empty double parentheses
        /\[\s*\]\s*\[\s*\]/                         // Empty double brackets
      ];
      
      for (const pattern of corruptionPatterns) {
        if (pattern.test(after) && !pattern.test(before)) {
          return false;
        }
      }
      
      // Check for severe size changes (potential corruption)
      const sizeDifference = Math.abs(after.length - before.length) / before.length;
      if (sizeDifference > 0.5) { // More than 50% size change
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.warn(`WARNING: Transformation validation error: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Calculate changes between two code strings
   */
  calculateChanges(before, after) {
    if (before === after) return 0;
    
    try {
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
      
    } catch (error) {
      console.warn(`WARNING: Could not calculate changes: ${error.message}`);
      return 0;
    }
  }
  
  /**
   * Detect improvements made by a layer
   */
  detectImprovements(before, after, layerId) {
    const improvements = [];
    
    try {
      // Layer-specific improvement detection
      switch (layerId) {
        case 1: // Configuration
          if (before.includes('"target": "es5"') && after.includes('"target": "ES2020"')) {
            improvements.push('TypeScript target upgraded');
          }
          if (before.includes('reactStrictMode: false') && after.includes('reactStrictMode: true')) {
            improvements.push('React strict mode enabled');
          }
          break;
          
        case 2: // Patterns
          const htmlEntities = (before.match(/&quot;|&amp;|&lt;|&gt;/g) || []).length;
          const htmlEntitiesAfter = (after.match(/&quot;|&amp;|&lt;|&gt;/g) || []).length;
          if (htmlEntities > htmlEntitiesAfter) {
            improvements.push(`${htmlEntities - htmlEntitiesAfter} HTML entities cleaned`);
          }
          
          const consoleLogs = (before.match(/console\.log/g) || []).length;
          const consoleLogsAfter = (after.match(/console\.log/g) || []).length;
          if (consoleLogs > consoleLogsAfter) {
            improvements.push(`${consoleLogs - consoleLogsAfter} console.log statements updated`);
          }
          break;
          
        case 3: // Components
          const missingKeys = (before.match(/\.map\s*\([^)]*\)\s*=>\s*<[^>]*(?!.*key=)/g) || []).length;
          const missingKeysAfter = (after.match(/\.map\s*\([^)]*\)\s*=>\s*<[^>]*(?!.*key=)/g) || []).length;
          if (missingKeys > missingKeysAfter) {
            improvements.push(`${missingKeys - missingKeysAfter} missing key props added`);
          }
          break;
          
        case 4: // Hydration
          const unguardedLocalStorage = (before.match(/(?<!typeof window !== "undefined" && )localStorage\./g) || []).length;
          const unguardedLocalStorageAfter = (after.match(/(?<!typeof window !== "undefined" && )localStorage\./g) || []).length;
          if (unguardedLocalStorage > unguardedLocalStorageAfter) {
            improvements.push(`${unguardedLocalStorage - unguardedLocalStorageAfter} SSR guards added`);
          }
          break;
          
        case 5: // Next.js
          improvements.push('Next.js optimizations applied');
          break;
          
        case 6: // Testing
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
   * Get layer information and metadata
   */
  getLayerInfo(layerId) {
    const layerDescriptions = {
      1: { name: 'Configuration', description: 'TypeScript & Next.js config optimization', critical: true },
      2: { name: 'Entity Cleanup', description: 'HTML entities and pattern fixes', critical: false },
      3: { name: 'Components', description: 'React component improvements', critical: false },
      4: { name: 'Hydration', description: 'SSR safety and hydration fixes', critical: true },
      5: { name: 'Next.js', description: 'Next.js specific optimizations', critical: false },
      6: { name: 'Testing', description: 'Test setup and improvements', critical: false }
    };
    
    return layerDescriptions[layerId] || { 
      name: `Layer ${layerId}`, 
      description: 'Unknown layer', 
      critical: false 
    };
  }
  
  /**
   * Get execution statistics and health check
   */
  getHealthCheck() {
    const validation = this.validateLayerFiles();
    
    return {
      totalLayers: Object.keys(this.layerFiles).length,
      availableLayers: validation.existing.length,
      missingLayers: validation.missing.length,
      invalidLayers: validation.invalid.length,
      layersPath: this.layersPath,
      tempPath: this.tempDir,
      projectRoot: this.projectRoot,
      status: validation.missing.length === 0 ? 'healthy' : 'degraded'
    };
  }
  
  /**
   * Clean up temporary files and resources
   */
  cleanup() {
    try {
      if (fs.existsSync(this.tempDir)) {
        // Remove all files in temp directory
        const files = fs.readdirSync(this.tempDir);
        for (const file of files) {
          const filePath = path.join(this.tempDir, file);
          try {
            fs.unlinkSync(filePath);
          } catch (error) {
            console.warn(`WARNING: Could not remove temp file ${filePath}: ${error.message}`);
          }
        }
        
        // Remove temp directory
        try {
          fs.rmdirSync(this.tempDir);
        } catch (error) {
          console.warn(`WARNING: Could not remove temp directory ${this.tempDir}: ${error.message}`);
        }
      }
    } catch (error) {
      console.warn(`WARNING: Cleanup failed: ${error.message}`);
    }
  }
}

module.exports = LayerIntegrator;