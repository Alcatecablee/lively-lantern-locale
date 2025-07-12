
/**
 * Layer Dependency Manager
 * Manages dependencies between transformation layers
 */

export class LayerDependencyManager {
  private static dependencies = {
    1: [], // Configuration has no dependencies
    2: [1], // Patterns depend on configuration
    3: [1, 2], // Components depend on config and patterns
    4: [1, 2, 3], // Hydration depends on previous layers
    5: [1, 2], // Next.js depends on config and patterns
    6: [1, 2, 3, 4, 5] // Testing depends on all previous layers
  };

  static validateAndCorrectLayers(requestedLayers: number[]) {
    const warnings: string[] = [];
    const correctedLayers = new Set<number>();

    // Add dependencies for each requested layer
    for (const layer of requestedLayers) {
      this.addLayerWithDependencies(layer, correctedLayers, warnings);
    }

    return {
      correctedLayers: Array.from(correctedLayers).sort((a, b) => a - b),
      warnings
    };
  }

  private static addLayerWithDependencies(
    layer: number, 
    correctedLayers: Set<number>, 
    warnings: string[]
  ) {
    const dependencies = this.dependencies[layer as keyof typeof this.dependencies] || [];
    
    // Add missing dependencies
    for (const dep of dependencies) {
      if (!correctedLayers.has(dep)) {
        correctedLayers.add(dep);
        warnings.push(`Added Layer ${dep} as dependency for Layer ${layer}`);
      }
    }
    
    correctedLayers.add(layer);
  }
}
