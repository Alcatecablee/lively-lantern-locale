
/**
 * Sophisticated layer dependency system ensures proper execution order
 * Validates that required layers are included when others are selected
 */
export class LayerDependencyManager {
  
  private static readonly DEPENDENCIES = {
    1: [], // Configuration has no dependencies
    2: [1], // Entity cleanup depends on config foundation
    3: [1, 2], // Components depend on config + cleanup
    4: [1, 2, 3], // Hydration depends on all previous layers
    5: [1, 2, 3, 4], // Next.js depends on all previous
    6: [1, 2, 3, 4, 5], // Testing depends on all previous
  };
  
  private static readonly LAYER_INFO = {
    1: { name: 'Configuration', critical: true, description: 'Foundation setup' },
    2: { name: 'Entity Cleanup', critical: false, description: 'Preprocessing patterns' },
    3: { name: 'Components', critical: false, description: 'React/TS specific fixes' },
    4: { name: 'Hydration', critical: false, description: 'Runtime safety guards' },
    5: { name: 'Next.js', critical: false, description: 'App Router fixes' },
    6: { name: 'Testing', critical: false, description: 'Validation and testing' },
  };
  
  /**
   * Validates and potentially auto-corrects layer selection
   */
  static validateAndCorrectLayers(requestedLayers: number[]): {
    correctedLayers: number[];
    warnings: string[];
    autoAdded: number[];
    criticalMissing: number[];
  } {
    const warnings: string[] = [];
    const autoAdded: number[] = [];
    const criticalMissing: number[] = [];
    let correctedLayers = [...requestedLayers];
    
    // Sort layers in execution order
    correctedLayers.sort((a, b) => a - b);
    
    // Check dependencies for each requested layer
    for (const layerId of requestedLayers) {
      const dependencies = this.DEPENDENCIES[layerId as keyof typeof this.DEPENDENCIES] || [];
      const missingDeps = dependencies.filter(dep => !correctedLayers.includes(dep));
      
      if (missingDeps.length > 0) {
        // Categorize missing dependencies
        const criticalDeps = missingDeps.filter(dep => this.LAYER_INFO[dep as keyof typeof this.LAYER_INFO]?.critical);
        const nonCriticalDeps = missingDeps.filter(dep => !this.LAYER_INFO[dep as keyof typeof this.LAYER_INFO]?.critical);
        
        // Auto-add all missing dependencies
        correctedLayers.push(...missingDeps);
        autoAdded.push(...missingDeps);
        
        // Track critical missing for special handling
        if (criticalDeps.length > 0) {
          criticalMissing.push(...criticalDeps);
        }
        
        warnings.push(
          `Layer ${layerId} (${this.LAYER_INFO[layerId as keyof typeof this.LAYER_INFO]?.name}) requires ` +
          `${missingDeps.map(dep => `${dep} (${this.LAYER_INFO[dep as keyof typeof this.LAYER_INFO]?.name})`).join(', ')}. ` +
          `Auto-added missing dependencies.`
        );
      }
    }
    
    // Remove duplicates and sort
    correctedLayers = [...new Set(correctedLayers)].sort((a, b) => a - b);
    
    // Validate execution order integrity
    const executionOrder = this.validateExecutionOrder(correctedLayers);
    if (!executionOrder.valid) {
      warnings.push(`Execution order issue: ${executionOrder.reason}`);
    }
    
    return {
      correctedLayers,
      warnings,
      autoAdded,
      criticalMissing
    };
  }
  
  /**
   * Suggests optimal layer combinations based on code analysis
   */
  static suggestLayers(code: string, filePath?: string): {
    recommended: number[];
    reasons: string[];
    confidence: number;
    impact: 'low' | 'medium' | 'high';
  } {
    const recommended: number[] = [];
    const reasons: string[] = [];
    
    // Always recommend config layer for foundation
    recommended.push(1);
    reasons.push('Configuration layer provides essential foundation');
    
    // Advanced pattern detection for layer suggestions
    const patterns = this.analyzeCodePatterns(code, filePath);
    
    if (patterns.hasEntityIssues) {
      recommended.push(2);
      reasons.push(`Entity cleanup needed: ${patterns.entityCount} HTML entities detected`);
    }
    
    if (patterns.hasComponentIssues) {
      recommended.push(3);
      reasons.push(`Component fixes needed: ${patterns.componentIssues.join(', ')}`);
    }
    
    if (patterns.hasHydrationIssues) {
      recommended.push(4);
      reasons.push(`Hydration fixes needed: ${patterns.hydrationIssues.join(', ')}`);
    }
    
    if (patterns.hasNextjsIssues) {
      recommended.push(5);
      reasons.push(`Next.js fixes needed: ${patterns.nextjsIssues.join(', ')}`);
    }
    
    if (patterns.hasTestingIssues) {
      recommended.push(6);
      reasons.push(`Testing improvements needed: ${patterns.testingIssues.join(', ')}`);
    }
    
    const confidence = this.calculateConfidence(patterns);
    const impact = this.estimateImpact(patterns);
    
    return { recommended, reasons, confidence, impact };
  }
  
  private static analyzeCodePatterns(code: string, filePath?: string): {
    hasEntityIssues: boolean;
    entityCount: number;
    hasComponentIssues: boolean;
    componentIssues: string[];
    hasHydrationIssues: boolean;
    hydrationIssues: string[];
    hasNextjsIssues: boolean;
    nextjsIssues: string[];
    hasTestingIssues: boolean;
    testingIssues: string[];
  } {
    const componentIssues: string[] = [];
    const hydrationIssues: string[] = [];
    const nextjsIssues: string[] = [];
    const testingIssues: string[] = [];
    
    // Entity pattern detection
    const entityPatterns = [/&quot;/g, /&amp;/g, /&lt;/g, /&gt;/g, /&#x27;/g];
    const entityCount = entityPatterns.reduce((count, pattern) => {
      const matches = code.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Component issue detection
    if (code.includes('.map(') && !code.includes('key=')) {
      componentIssues.push('missing key props in map functions');
    }
    if (code.includes('<img') && !code.includes('alt=')) {
      componentIssues.push('missing alt attributes on images');
    }
    if (code.includes('useState') && !code.includes('import { useState')) {
      componentIssues.push('missing React hook imports');
    }
    
    // Hydration issue detection
    if (code.includes('localStorage') && !code.includes('typeof window')) {
      hydrationIssues.push('unguarded localStorage access');
    }
    if (code.includes('window.') && !code.includes('typeof window')) {
      hydrationIssues.push('unguarded window access');
    }
    if (code.includes('document.') && !code.includes('typeof document')) {
      hydrationIssues.push('unguarded document access');
    }
    
    // Next.js issue detection
    if (code.includes("'use client'") && code.indexOf("'use client'") > 0) {
      nextjsIssues.push('misplaced use client directive');
    }
    if (/import\s*{\s*$|import\s*{\s*\n\s*import/m.test(code)) {
      nextjsIssues.push('corrupted import statements');
    }
    
    // Testing issue detection
    if (code.includes('export default function') && !code.includes('interface') && code.includes('props')) {
      testingIssues.push('missing prop type definitions');
    }
    if (code.includes('async') && !code.includes('try') && !code.includes('catch')) {
      testingIssues.push('missing error handling in async functions');
    }
    
    return {
      hasEntityIssues: entityCount > 0,
      entityCount,
      hasComponentIssues: componentIssues.length > 0,
      componentIssues,
      hasHydrationIssues: hydrationIssues.length > 0,
      hydrationIssues,
      hasNextjsIssues: nextjsIssues.length > 0,
      nextjsIssues,
      hasTestingIssues: testingIssues.length > 0,
      testingIssues
    };
  }
  
  private static validateExecutionOrder(layers: number[]): { valid: boolean; reason?: string } {
    for (let i = 0; i < layers.length; i++) {
      const currentLayer = layers[i];
      const dependencies = this.DEPENDENCIES[currentLayer as keyof typeof this.DEPENDENCIES] || [];
      
      for (const dep of dependencies) {
        const depIndex = layers.indexOf(dep);
        if (depIndex === -1) {
          return { valid: false, reason: `Missing dependency ${dep} for layer ${currentLayer}` };
        }
        if (depIndex > i) {
          return { valid: false, reason: `Dependency ${dep} must execute before layer ${currentLayer}` };
        }
      }
    }
    
    return { valid: true };
  }
  
  private static calculateConfidence(patterns: any): number {
    const totalIssues = Object.values(patterns).filter(value => 
      typeof value === 'boolean' && value
    ).length;
    
    const issueCount = patterns.entityCount + 
      patterns.componentIssues.length + 
      patterns.hydrationIssues.length + 
      patterns.nextjsIssues.length + 
      patterns.testingIssues.length;
    
    if (totalIssues === 0) return 0.5;
    return Math.min(0.95, 0.6 + (issueCount / (totalIssues * 5)) * 0.35);
  }
  
  private static estimateImpact(patterns: any): 'low' | 'medium' | 'high' {
    const criticalIssues = patterns.hydrationIssues.length + patterns.nextjsIssues.length;
    const totalIssues = patterns.componentIssues.length + patterns.testingIssues.length + patterns.entityCount;
    
    if (criticalIssues > 2) return 'high';
    if (criticalIssues > 0 || totalIssues > 5) return 'medium';
    return 'low';
  }
}
