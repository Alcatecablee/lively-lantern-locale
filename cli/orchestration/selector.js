
// SmartLayerSelector - Recommend layers based on code analysis
class SmartLayerSelector {
  static analyzeCode(content) {
    const recommendations = [];

    // Analyze for Layer 1 (Configuration)
    if (content.includes('tsconfig.json') && content.includes('"target": "es5"')) {
      recommendations.push('Layer 1: Upgrade TypeScript configuration');
    }

    // Analyze for Layer 2 (Patterns)
    if (content.includes('&quot;') || content.includes('&amp;')) {
      recommendations.push('Layer 2: Fix HTML entity corruption');
    }

    // Analyze for Layer 3 (Components)
    if (content.includes('.map(') && !content.includes('key=')) {
      recommendations.push('Layer 3: Add missing React keys');
    }

    // Analyze for Layer 4 (Hydration)
    if (content.includes('localStorage') && !content.includes('typeof window')) {
      recommendations.push('Layer 4: Add SSR guards for localStorage');
    }

    // Analyze for Layer 5 (Next.js)
    if (content.includes('useState') && !content.includes("'use client'")) {
      recommendations.push('Layer 5: Add Next.js client directive');
    }

    // Analyze for Layer 6 (Testing)
    if (content.includes('test(') || content.includes('describe(')) {
      recommendations.push('Layer 6: Enhance testing patterns');
    }

    return recommendations;
  }

  // Get minimal layer set needed for specific issues
  static getMinimalLayerSet(issues) {
    const layerMap = {
      'config': [1],
      'entities': [2],
      'components': [3],
      'hydration': [4],
      'nextjs': [5],
      'testing': [6]
    };

    const requiredLayers = new Set();
    issues.forEach(issue => {
      const layers = layerMap[issue] || [];
      layers.forEach(layer => requiredLayers.add(layer));
    });

    return Array.from(requiredLayers).sort();
  }
}

module.exports = SmartLayerSelector;
