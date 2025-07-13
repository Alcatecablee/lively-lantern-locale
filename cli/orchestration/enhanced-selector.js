
// Enhanced Smart Layer Selection following orchestration patterns
class EnhancedSmartLayerSelector {
  
  /**
   * Analyze code and suggest appropriate layers with detailed reasoning
   */
  static analyzeAndRecommend(code, filePath) {
    const issues = this.detectIssues(code, filePath);
    const recommendations = this.generateRecommendations(issues);
    
    return {
      recommendedLayers: recommendations.layers,
      detectedIssues: issues,
      reasoning: recommendations.reasons,
      confidence: this.calculateConfidence(issues),
      estimatedImpact: this.estimateImpact(issues)
    };
  }
  
  /**
   * Detect specific issues in code that layers can fix
   */
  static detectIssues(code, filePath) {
    const issues = [];
    
    // Layer 1: Configuration issues
    if (filePath && (filePath.includes('tsconfig') || filePath.includes('next.config'))) {
      if (code.includes('"target": "es5"') || code.includes('reactStrictMode: false')) {
        issues.push({
          type: 'config',
          severity: 'high',
          description: 'Outdated configuration detected',
          fixedByLayer: 1,
          pattern: 'Configuration modernization needed'
        });
      }
    }
    
    // Layer 2: Entity and pattern issues
    const entityPatterns = [
      { pattern: /&quot;/g, name: 'HTML quote entities', severity: 'medium' },
      { pattern: /&amp;/g, name: 'HTML ampersand entities', severity: 'medium' },
      { pattern: /&lt;|&gt;/g, name: 'HTML bracket entities', severity: 'medium' },
      { pattern: /console\.log\(/g, name: 'Console.log usage', severity: 'low' },
      { pattern: /\bvar\s+/g, name: 'Var declarations', severity: 'medium' }
    ];
    
    entityPatterns.forEach(({ pattern, name, severity }) => {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          type: 'pattern',
          severity,
          description: `${name} found (${matches.length} occurrences)`,
          fixedByLayer: 2,
          pattern: name,
          count: matches.length
        });
      }
    });
    
    // Layer 3: Component issues
    if (this.isReactComponent(code)) {
      // Missing key props in map functions - high priority
      const mapWithoutKey = /\.map\s*\([^)]*\)\s*=>\s*<[^>]*(?!.*key=)/g;
      const mapMatches = code.match(mapWithoutKey);
      if (mapMatches) {
        issues.push({
          type: 'component',
          severity: 'high',
          description: `Missing key props in ${mapMatches.length} map operations`,
          fixedByLayer: 3,
          pattern: 'Missing key props',
          count: mapMatches.length
        });
      }
      
      // Missing React imports - critical
      if (code.includes('useState') && !code.includes('import { useState')) {
        issues.push({
          type: 'component',
          severity: 'high',
          description: 'Missing React hook imports',
          fixedByLayer: 3,
          pattern: 'Missing imports'
        });
      }
      
      // Accessibility issues - medium priority
      const imgWithoutAlt = /<img(?![^>]*alt=)[^>]*>/g;
      const imgMatches = code.match(imgWithoutAlt);
      if (imgMatches) {
        issues.push({
          type: 'component',
          severity: 'medium',
          description: `${imgMatches.length} images missing alt attributes`,
          fixedByLayer: 3,
          pattern: 'Accessibility issues',
          count: imgMatches.length
        });
      }
    }
    
    // Layer 4: Hydration issues - critical for SSR
    if (code.includes('localStorage') && !code.includes('typeof window')) {
      const localStorageMatches = code.match(/localStorage\./g);
      issues.push({
        type: 'hydration',
        severity: 'high',
        description: `${localStorageMatches?.length || 1} unguarded localStorage usage`,
        fixedByLayer: 4,
        pattern: 'SSR safety',
        count: localStorageMatches?.length || 1
      });
    }
    
    // Window object usage without guards
    if (code.includes('window.') && !code.includes('typeof window')) {
      const windowMatches = code.match(/window\./g);
      issues.push({
        type: 'hydration',
        severity: 'high',
        description: `${windowMatches?.length || 1} unguarded window usage`,
        fixedByLayer: 4,
        pattern: 'Window access safety',
        count: windowMatches?.length || 1
      });
    }
    
    return issues;
  }
  
  /**
   * Generate layer recommendations based on detected issues
   */
  static generateRecommendations(issues) {
    const layers = new Set();
    const reasons = [];
    
    // Group issues by layer
    const issuesByLayer = issues.reduce((acc, issue) => {
      if (!acc[issue.fixedByLayer]) {
        acc[issue.fixedByLayer] = [];
      }
      acc[issue.fixedByLayer].push(issue);
      return acc;
    }, {});
    
    // Always include layer 1 for foundation
    layers.add(1);
    reasons.push('Configuration layer provides essential foundation');
    
    // Add layers based on detected issues with priority
    Object.entries(issuesByLayer).forEach(([layerId, layerIssues]) => {
      const id = parseInt(layerId);
      layers.add(id);
      
      const criticalIssues = layerIssues.filter(i => i.severity === 'high').length;
      const mediumIssues = layerIssues.filter(i => i.severity === 'medium').length;
      const lowIssues = layerIssues.filter(i => i.severity === 'low').length;
      
      let reason = `Layer ${id}:`;
      if (criticalIssues > 0) reason += ` ${criticalIssues} critical issues`;
      if (mediumIssues > 0) reason += ` ${mediumIssues} medium issues`;
      if (lowIssues > 0) reason += ` ${lowIssues} low priority issues`;
      
      reasons.push(reason);
    });
    
    // Ensure dependency order
    const sortedLayers = Array.from(layers).sort((a, b) => a - b);
    
    return {
      layers: sortedLayers,
      reasons
    };
  }
  
  /**
   * Get minimal layer set needed for specific issues
   */
  static getMinimalLayerSet(issues) {
    const layerMap = {
      'config': [1],
      'entities': [2],
      'patterns': [2],
      'components': [3],
      'hydration': [4],
      'ssr': [4]
    };
    
    const requiredLayers = new Set();
    issues.forEach(issue => {
      const layers = layerMap[issue] || [];
      layers.forEach(layer => requiredLayers.add(layer));
    });
    
    return Array.from(requiredLayers).sort();
  }
  
  static isReactComponent(code) {
    return code.includes('import React') || 
           code.includes('import { ') || 
           (code.includes('function ') && code.includes('return (')) ||
           (code.includes('const ') && code.includes('=> (')) ||
           code.includes('useState') ||
           code.includes('useEffect');
  }
  
  static calculateConfidence(issues) {
    const totalIssues = issues.length;
    const highSeverityCount = issues.filter(i => i.severity === 'high').length;
    
    if (totalIssues === 0) return 0.5; // Neutral confidence when no issues
    
    // Higher confidence when more high-severity issues are detected
    return Math.min(0.95, 0.6 + (highSeverityCount / totalIssues) * 0.35);
  }
  
  static estimateImpact(issues) {
    const totalIssues = issues.length;
    const criticalCount = issues.filter(i => i.severity === 'high').length;
    
    let level, description, estimatedFixTime;
    
    if (criticalCount > 5) {
      level = 'high';
      description = `${totalIssues} total issues, ${criticalCount} critical - significant improvements expected`;
      estimatedFixTime = Math.max(60, totalIssues * 15) + ' seconds';
    } else if (criticalCount > 0) {
      level = 'medium';
      description = `${totalIssues} total issues, ${criticalCount} critical - moderate improvements expected`;
      estimatedFixTime = Math.max(30, totalIssues * 10) + ' seconds';
    } else {
      level = 'low';
      description = `${totalIssues} total issues, minor improvements expected`;
      estimatedFixTime = Math.max(15, totalIssues * 5) + ' seconds';
    }
    
    return { level, description, estimatedFixTime };
  }
}

module.exports = EnhancedSmartLayerSelector;
