
// LayerDependencyManager - Manage layer dependencies and execution order
class LayerDependencyManager {
  static dependencies = {
    1: [], // Config has no dependencies
    2: [1], // Patterns depend on config
    3: [1, 2], // Components depend on config and patterns
    4: [1, 2, 3], // Hydration depends on previous layers
    5: [1, 2, 3, 4], // Next.js depends on all previous
    6: [1, 2, 3, 4, 5] // Testing depends on all others
  };

  // Get proper execution order respecting dependencies
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

  // Auto-correct layer selection based on dependencies
  static autoCorrectSelection(selectedLayers) {
    const corrected = [];
    const warnings = [];

    selectedLayers.forEach(layer => {
      const missingDeps = this.dependencies[layer].filter(dep => 
        !selectedLayers.includes(dep)
      );

      if (missingDeps.length > 0) {
        corrected.push(...missingDeps);
        warnings.push(`Layer ${layer} requires layers ${missingDeps.join(', ')}`);
      }
      corrected.push(layer);
    });

    return {
      layers: [...new Set(corrected)].sort((a, b) => a - b),
      warnings
    };
  }
}

module.exports = LayerDependencyManager;
