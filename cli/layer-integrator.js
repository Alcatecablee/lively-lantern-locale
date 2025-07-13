const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Layer Integrator - Bridges CLI with actual layer implementations
 * Executes the individual layer files located in src/lib/neurolint/layers/
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
  }

  /**
   * Check if all layer files exist
   */
  validateLayerFiles() {
    const missing = [];
    const existing = [];
    
    Object.entries(this.layerFiles).forEach(([layerId, filename]) => {
      const fullPath = path.join(this.layersPath, filename);
      if (fs.existsSync(fullPath)) {
        existing.push(parseInt(layerId));
      } else {
        missing.push(parseInt(layerId));
      }
    });
    
    return { existing, missing };
  }

  /**
   * Execute a specific layer on code
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
    
    try {
      // Import and execute the layer module
      delete require.cache[require.resolve(layerPath)];
      const layerModule = require(layerPath);
      
      // Check if layer exports a function or object
      if (typeof layerModule === 'function') {
        return await layerModule(code, filePath, options);
      } else if (layerModule.process && typeof layerModule.process === 'function') {
        return await layerModule.process(code, filePath, options);
      } else if (layerModule.execute && typeof layerModule.execute === 'function') {
        return await layerModule.execute(code, filePath, options);
      } else {
        // Fallback: execute the layer as a script with code as input
        return await this.executeLayerAsScript(layerId, code, filePath, options);
      }
      
    } catch (error) {
      throw new Error(`Layer ${layerId} execution failed: ${error.message}`);
    }
  }
  
  /**
   * Execute layer as external script (fallback method)
   */
  async executeLayerAsScript(layerId, code, filePath, options = {}) {
    const layerFile = this.layerFiles[layerId];
    const layerPath = path.join(this.layersPath, layerFile);
    
    // Create temporary file with the code
    const tempDir = path.join(this.projectRoot, '.neurolint-temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFile = path.join(tempDir, `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.js`);
    fs.writeFileSync(tempFile, code);
    
    try {
      // Execute the layer script
      const command = `node "${layerPath}" "${tempFile}"`;
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectRoot,
        timeout: 30000 // 30 second timeout
      });
      
      if (stderr && !options.ignoreWarnings) {
        console.warn(`Layer ${layerId} warnings:`, stderr);
      }
      
      // Read the transformed code
      const transformedCode = fs.readFileSync(tempFile, 'utf8');
      
      return {
        code: transformedCode,
        changes: this.calculateChanges(code, transformedCode),
        output: stdout,
        warnings: stderr
      };
      
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }
  
  /**
   * Execute multiple layers in sequence
   */
  async executeLayers(layerIds, code, filePath, options = {}) {
    let current = code;
    const results = [];
    const startTime = Date.now();
    
    for (const layerId of layerIds) {
      const layerStart = Date.now();
      const previous = current;
      
      try {
        if (options.verbose) {
          console.log(`  🔧 Executing Layer ${layerId}...`);
        }
        
        const result = await this.executeLayer(layerId, current, filePath, options);
        
        // Extract transformed code from result
        if (typeof result === 'string') {
          current = result;
        } else if (result && result.code) {
          current = result.code;
        }
        
        const layerTime = Date.now() - layerStart;
        const changes = this.calculateChanges(previous, current);
        
        results.push({
          layerId,
          success: true,
          executionTime: layerTime,
          changeCount: changes,
          improvements: this.detectImprovements(previous, current, layerId),
          code: current
        });
        
        if (options.verbose && changes > 0) {
          console.log(`    ✅ Applied ${changes} changes (${layerTime}ms)`);
        }
        
      } catch (error) {
        results.push({
          layerId,
          success: false,
          executionTime: Date.now() - layerStart,
          error: error.message,
          code: previous // Keep previous code on error
        });
        
        if (options.verbose) {
          console.log(`    ❌ Layer ${layerId} failed: ${error.message}`);
        }
        
        // Continue with previous code
        current = previous;
      }
    }
    
    return {
      finalCode: current,
      layerResults: results,
      summary: {
        totalExecutionTime: Date.now() - startTime,
        totalChanges: results.reduce((sum, r) => sum + (r.changeCount || 0), 0),
        successfulLayers: results.filter(r => r.success).length,
        failedLayers: results.filter(r => !r.success).length
      }
    };
  }
  
  /**
   * Calculate changes between two code strings
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
   * Detect improvements made by a layer
   */
  detectImprovements(before, after, layerId) {
    const improvements = [];
    
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
      improvements.push('Code transformations applied');
    }
    
    return improvements;
  }
  
  /**
   * Get layer information
   */
  getLayerInfo(layerId) {
    const layerDescriptions = {
      1: { name: 'Configuration', description: 'TypeScript & Next.js config optimization' },
      2: { name: 'Entity Cleanup', description: 'HTML entities and pattern fixes' },
      3: { name: 'Components', description: 'React component improvements' },
      4: { name: 'Hydration', description: 'SSR safety and hydration fixes' },
      5: { name: 'Next.js', description: 'Next.js specific optimizations' },
      6: { name: 'Testing', description: 'Test setup and improvements' }
    };
    
    return layerDescriptions[layerId] || { name: `Layer ${layerId}`, description: 'Unknown layer' };
  }
  
  /**
   * Clean up temporary files
   */
  cleanup() {
    const tempDir = path.join(this.projectRoot, '.neurolint-temp');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

module.exports = LayerIntegrator;