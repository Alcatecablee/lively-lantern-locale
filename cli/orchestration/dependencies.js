
/**
 * Layer Dependency Manager - Enterprise orchestration pattern implementation
 * Manages layer dependencies and execution order following sophisticated patterns
 */
class LayerDependencyManager {
  static dependencies = {
    1: [], // Config has no dependencies
    2: [1], // Patterns depend on config
    3: [1, 2], // Components depend on config and patterns
    4: [1, 2, 3], // Hydration depends on previous layers
    5: [1, 2, 3, 4], // Next.js depends on all previous
    6: [1, 2, 3, 4, 5] // Testing depends on all others
  };

  static layerInfo = {
    1: { name: 'Configuration', description: 'TypeScript & Next.js config optimization', critical: true },
    2: { name: 'Entity Cleanup', description: 'HTML entities and pattern fixes', critical: false },
    3: { name: 'Components', description: 'React component improvements', critical: false },
    4: { name: 'Hydration', description: 'SSR safety and hydration fixes', critical: true },
    5: { name: 'Next.js', description: 'Next.js specific optimizations', critical: false },
    6: { name: 'Testing', description: 'Test setup and improvements', critical: false }
  };

  /**
   * Validate and auto-correct layer selection (main orchestration method)
   */
  static validateAndCorrectLayers(requestedLayers) {
    const warnings = [];
    const autoAdded = [];
    let correctedLayers = [...requestedLayers];
    
    // Validate layer IDs
    const validLayers = correctedLayers.filter(layer => {
      if (layer >= 1 && layer <= 6) {
        return true;
      } else {
        warnings.push(`Invalid layer ID: ${layer} (valid range: 1-6)`);
        return false;
      }
    });
    
    // Add missing dependencies
    const withDependencies = new Set();
    
    validLayers.forEach(layerId => {
      // Add the layer itself
      withDependencies.add(layerId);
      
      // Add all dependencies
      this.dependencies[layerId].forEach(depId => {
        if (!validLayers.includes(depId)) {
          withDependencies.add(depId);
          autoAdded.push(depId);
          warnings.push(`Layer ${layerId} (${this.layerInfo[layerId].name}) requires Layer ${depId} (${this.layerInfo[depId].name}). Auto-added.`);
        } else {
          withDependencies.add(depId);
        }
      });
    });
    
    // Sort in execution order
    correctedLayers = Array.from(withDependencies).sort((a, b) => a - b);
    
    return {
      correctedLayers,
      warnings,
      autoAdded,
      originalLayers: requestedLayers
    };
  }

  /**
   * Get proper execution order respecting dependencies
   */
  static getExecutionOrder(requestedLayers, skipLayers = []) {
    const filtered = requestedLayers.filter(layer => !skipLayers.includes(layer));
    
    // Ensure dependencies are included
    const required = new Set();
    
    filtered.forEach(layer => {
      required.add(layer);
      this.dependencies[layer].forEach(dep => {
        if (!skipLayers.includes(dep)) {
          required.add(dep);
        }
      });
    });

    // Sort by dependency order (1→2→3→4→5→6)
    return Array.from(required).sort((a, b) => a - b);
  }

  /**
   * Check if layer selection is valid (all dependencies met)
   */
  static isValidSelection(selectedLayers) {
    for (const layer of selectedLayers) {
      const missingDeps = this.dependencies[layer].filter(dep => 
        !selectedLayers.includes(dep)
      );
      
      if (missingDeps.length > 0) {
        return {
          valid: false,
          missingDependencies: missingDeps,
          affectedLayer: layer
        };
      }
    }
    
    return { valid: true };
  }

  /**
   * Get minimal layer set for specific requirements
   */
  static getMinimalSet(requiredLayers) {
    const minimal = new Set();
    
    requiredLayers.forEach(layer => {
      minimal.add(layer);
      this.dependencies[layer].forEach(dep => minimal.add(dep));
    });
    
    return Array.from(minimal).sort((a, b) => a - b);
  }

  /**
   * Suggest layers based on detected issues
   */
  static suggestLayers(issueTypes) {
    const suggested = new Set();
    
    const typeToLayer = {
      'config': 1,
      'pattern': 2,
      'entity': 2,
      'component': 3,
      'hydration': 4,
      'ssr': 4,
      'nextjs': 5,
      'testing': 6
    };
    
    issueTypes.forEach(type => {
      const layer = typeToLayer[type.toLowerCase()];
      if (layer) {
        suggested.add(layer);
        // Add dependencies
        this.dependencies[layer].forEach(dep => suggested.add(dep));
      }
    });
    
    return Array.from(suggested).sort((a, b) => a - b);
  }

  /**
   * Get layer information
   */
  static getLayerInfo(layerId) {
    return this.layerInfo[layerId] || { 
      name: `Layer ${layerId}`, 
      description: 'Unknown layer', 
      critical: false 
    };
  }

  /**
   * Validate layer compatibility
   */
  static validateCompatibility(layers) {
    const compatibility = [];
    
    // Check for conflicting layers
    if (layers.includes(5) && !layers.includes(4)) {
      compatibility.push({
        type: 'warning',
        message: 'Next.js optimizations (Layer 5) work best with hydration fixes (Layer 4)'
      });
    }
    
    if (layers.includes(6) && !layers.includes(3)) {
      compatibility.push({
        type: 'info',
        message: 'Testing improvements (Layer 6) complement component fixes (Layer 3)'
      });
    }
    
    return compatibility;
  }
}

module.exports = LayerDependencyManager;
