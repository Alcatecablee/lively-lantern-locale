
/**
 * Enhanced Smart Layer Selection following orchestration patterns
 * Provides intelligent analysis and layer recommendations without external dependencies
 */
class EnhancedSmartLayerSelector {
  
  /**
   * Analyze code and suggest appropriate layers with detailed reasoning
   */
  static analyzeAndRecommend(code, filePath) {
    try {
      const issues = this.detectIssues(code, filePath);
      const recommendations = this.generateRecommendations(issues);
      
      return {
        recommendedLayers: recommendations.layers,
        detectedIssues: issues,
        reasoning: recommendations.reasons,
        confidence: this.calculateConfidence(issues),
        estimatedImpact: this.estimateImpact(issues),
        fileType: this.detectFileType(filePath),
        codeSize: code.length,
        analysisTimestamp: Date.now()
      };
      
    } catch (error) {
      console.warn(`WARNING: Code analysis failed: ${error.message}`);
      
      // Return fallback analysis
      return {
        recommendedLayers: [1, 2, 3, 4],
        detectedIssues: [],
        reasoning: ['Analysis failed, using default layers'],
        confidence: 0.5,
        estimatedImpact: { level: 'unknown', description: 'Analysis failed' },
        fileType: 'unknown',
        codeSize: code.length,
        analysisTimestamp: Date.now(),
        error: error.message
      };
    }
  }
  
  /**
   * Detect specific issues in code that layers can fix
   */
  static detectIssues(code, filePath) {
    const issues = [];
    
    try {
      // Layer 1: Configuration issues
      if (filePath && (filePath.includes('tsconfig') || filePath.includes('next.config') || filePath.includes('package.json'))) {
        const configIssues = this.detectConfigurationIssues(code, filePath);
        issues.push(...configIssues);
      }
      
      // Layer 2: Entity and pattern issues
      const entityIssues = this.detectEntityIssues(code);
      issues.push(...entityIssues);
      
      // Layer 3: Component issues (only for React files)
      if (this.isReactComponent(code, filePath)) {
        const componentIssues = this.detectComponentIssues(code);
        issues.push(...componentIssues);
      }
      
      // Layer 4: Hydration issues
      const hydrationIssues = this.detectHydrationIssues(code);
      issues.push(...hydrationIssues);
      
      // Layer 5: Next.js specific issues
      if (this.isNextJsFile(code, filePath)) {
        const nextjsIssues = this.detectNextJsIssues(code);
        issues.push(...nextjsIssues);
      }
      
      // Layer 6: Testing issues
      if (this.isTestFile(filePath)) {
        const testingIssues = this.detectTestingIssues(code);
        issues.push(...testingIssues);
      }
      
    } catch (error) {
      console.warn(`WARNING: Issue detection failed: ${error.message}`);
    }
    
    return issues;
  }
  
  /**
   * Detect configuration file issues
   */
  static detectConfigurationIssues(code, filePath) {
    const issues = [];
    
    try {
      if (filePath.includes('tsconfig')) {
        if (code.includes('"target": "es5"')) {
          issues.push({
            type: 'config',
            severity: 'high',
            description: 'TypeScript target is outdated (ES5)',
            fixedByLayer: 1,
            pattern: 'tsconfig-target',
            location: 'tsconfig.json'
          });
        }
        
        if (code.includes('"downlevelIteration": false') || !code.includes('downlevelIteration')) {
          issues.push({
            type: 'config',
            severity: 'medium',
            description: 'Missing downlevelIteration setting',
            fixedByLayer: 1,
            pattern: 'tsconfig-iteration',
            location: 'tsconfig.json'
          });
        }
      }
      
      if (filePath.includes('next.config')) {
        if (code.includes('reactStrictMode: false')) {
          issues.push({
            type: 'config',
            severity: 'high',
            description: 'React strict mode is disabled',
            fixedByLayer: 1,
            pattern: 'next-strict-mode',
            location: 'next.config.js'
          });
        }
        
        if (code.includes('appDir:')) {
          issues.push({
            type: 'config',
            severity: 'medium',
            description: 'Deprecated appDir configuration detected',
            fixedByLayer: 1,
            pattern: 'next-deprecated',
            location: 'next.config.js'
          });
        }
      }
      
    } catch (error) {
      console.warn(`WARNING: Configuration analysis failed: ${error.message}`);
    }
    
    return issues;
  }
  
  /**
   * Detect HTML entity and pattern issues
   */
  static detectEntityIssues(code) {
    const issues = [];
    
    try {
      const entityPatterns = [
        { pattern: /&quot;/g, name: 'HTML quote entities', severity: 'medium' },
        { pattern: /&amp;/g, name: 'HTML ampersand entities', severity: 'medium' },
        { pattern: /&lt;|&gt;/g, name: 'HTML bracket entities', severity: 'medium' },
        { pattern: /console\.log\(/g, name: 'Console.log usage', severity: 'low' },
        { pattern: /\bvar\s+/g, name: 'Legacy var declarations', severity: 'medium' },
        { pattern: /function\s*\(\s*\)\s*{\s*return\s+/g, name: 'Convertible to arrow function', severity: 'low' }
      ];
      
      entityPatterns.forEach(({ pattern, name, severity }) => {
        try {
          const matches = code.match(pattern);
          if (matches && matches.length > 0) {
            issues.push({
              type: 'pattern',
              severity,
              description: `${name} found (${matches.length} occurrences)`,
              fixedByLayer: 2,
              pattern: name.toLowerCase().replace(/\s+/g, '-'),
              count: matches.length
            });
          }
        } catch (error) {
          console.warn(`WARNING: Pattern matching failed for ${name}: ${error.message}`);
        }
      });
      
    } catch (error) {
      console.warn(`WARNING: Entity issue detection failed: ${error.message}`);
    }
    
    return issues;
  }
  
  /**
   * Detect React component issues
   */
  static detectComponentIssues(code) {
    const issues = [];
    
    try {
      // Missing key props in map functions
      const mapWithoutKeyRegex = /\.map\s*\(\s*[^)]*\s*\)\s*=>\s*<[^>]*(?![^>]*key\s*=)/g;
      const mapMatches = code.match(mapWithoutKeyRegex);
      if (mapMatches && mapMatches.length > 0) {
        issues.push({
          type: 'component',
          severity: 'high',
          description: `Missing key props in ${mapMatches.length} map operations`,
          fixedByLayer: 3,
          pattern: 'missing-keys',
          count: mapMatches.length
        });
      }
      
      // Missing React imports
      if (code.includes('useState') && !code.includes('import { useState')) {
        issues.push({
          type: 'component',
          severity: 'high',
          description: 'Missing React hook imports',
          fixedByLayer: 3,
          pattern: 'missing-imports'
        });
      }
      
      // Images without alt attributes
      const imgWithoutAltRegex = /<img(?![^>]*alt\s*=)[^>]*>/g;
      const imgMatches = code.match(imgWithoutAltRegex);
      if (imgMatches && imgMatches.length > 0) {
        issues.push({
          type: 'component',
          severity: 'medium',
          description: `${imgMatches.length} images missing alt attributes`,
          fixedByLayer: 3,
          pattern: 'accessibility-alt',
          count: imgMatches.length
        });
      }
      
      // Button components without variant props
      const buttonWithoutVariantRegex = /<Button(?![^>]*variant\s*=)[^>]*>/g;
      const buttonMatches = code.match(buttonWithoutVariantRegex);
      if (buttonMatches && buttonMatches.length > 0) {
        issues.push({
          type: 'component',
          severity: 'low',
          description: `${buttonMatches.length} buttons missing variant props`,
          fixedByLayer: 3,
          pattern: 'button-variants',
          count: buttonMatches.length
        });
      }
      
    } catch (error) {
      console.warn(`WARNING: Component issue detection failed: ${error.message}`);
    }
    
    return issues;
  }
  
  /**
   * Detect hydration and SSR issues
   */
  static detectHydrationIssues(code) {
    const issues = [];
    
    try {
      // Unguarded localStorage usage
      const unguardedLocalStorageRegex = /(?<!typeof window !== "undefined" && )localStorage\./g;
      const localStorageMatches = code.match(unguardedLocalStorageRegex);
      if (localStorageMatches && localStorageMatches.length > 0) {
        issues.push({
          type: 'hydration',
          severity: 'high',
          description: `${localStorageMatches.length} unguarded localStorage usage`,
          fixedByLayer: 4,
          pattern: 'ssr-localstorage',
          count: localStorageMatches.length
        });
      }
      
      // Unguarded window usage
      const unguardedWindowRegex = /(?<!typeof )window\./g;
      const windowMatches = code.match(unguardedWindowRegex);
      if (windowMatches && windowMatches.length > 0) {
        issues.push({
          type: 'hydration',
          severity: 'high',
          description: `${windowMatches.length} unguarded window usage`,
          fixedByLayer: 4,
          pattern: 'ssr-window',
          count: windowMatches.length
        });
      }
      
      // Theme provider hydration issues
      if (code.includes('ThemeProvider') && !code.includes('mounted')) {
        issues.push({
          type: 'hydration',
          severity: 'medium',
          description: 'ThemeProvider may cause hydration mismatches',
          fixedByLayer: 4,
          pattern: 'theme-hydration'
        });
      }
      
    } catch (error) {
      console.warn(`WARNING: Hydration issue detection failed: ${error.message}`);
    }
    
    return issues;
  }
  
  /**
   * Detect Next.js specific issues
   */
  static detectNextJsIssues(code) {
    const issues = [];
    
    try {
      // Missing Image component optimization
      if (code.includes('<img') && !code.includes('next/image')) {
        issues.push({
          type: 'nextjs',
          severity: 'medium',
          description: 'Using img tag instead of Next.js Image component',
          fixedByLayer: 5,
          pattern: 'nextjs-image'
        });
      }
      
      // Missing Link component optimization
      if (code.includes('<a href') && !code.includes('next/link')) {
        issues.push({
          type: 'nextjs',
          severity: 'medium',
          description: 'Using anchor tag instead of Next.js Link component',
          fixedByLayer: 5,
          pattern: 'nextjs-link'
        });
      }
      
    } catch (error) {
      console.warn(`WARNING: Next.js issue detection failed: ${error.message}`);
    }
    
    return issues;
  }
  
  /**
   * Detect testing issues
   */
  static detectTestingIssues(code) {
    const issues = [];
    
    try {
      // Missing test setup
      if (!code.includes('describe') && !code.includes('test') && !code.includes('it')) {
        issues.push({
          type: 'testing',
          severity: 'low',
          description: 'No test structure detected',
          fixedByLayer: 6,
          pattern: 'test-structure'
        });
      }
      
      // Missing testing library imports
      if (code.includes('render') && !code.includes('@testing-library')) {
        issues.push({
          type: 'testing',
          severity: 'medium',
          description: 'Missing testing library imports',
          fixedByLayer: 6,
          pattern: 'test-imports'
        });
      }
      
    } catch (error) {
      console.warn(`WARNING: Testing issue detection failed: ${error.message}`);
    }
    
    return issues;
  }
  
  /**
   * Generate layer recommendations based on detected issues
   */
  static generateRecommendations(issues) {
    try {
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
      
      // Always include layer 1 for foundation (if config issues exist)
      if (issuesByLayer[1] && issuesByLayer[1].length > 0) {
        layers.add(1);
        reasons.push('Configuration layer needed for foundation fixes');
      }
      
      // Add layers based on detected issues
      Object.entries(issuesByLayer).forEach(([layerId, layerIssues]) => {
        const id = parseInt(layerId);
        if (id > 1) { // Layer 1 already handled above
          layers.add(id);
          
          const highSeverity = layerIssues.filter(i => i.severity === 'high').length;
          const mediumSeverity = layerIssues.filter(i => i.severity === 'medium').length;
          const lowSeverity = layerIssues.filter(i => i.severity === 'low').length;
          
          if (highSeverity > 0) {
            reasons.push(`Layer ${id}: ${highSeverity} critical issues detected`);
          } else if (mediumSeverity > 0) {
            reasons.push(`Layer ${id}: ${mediumSeverity} medium priority issues detected`);
          } else if (lowSeverity > 0) {
            reasons.push(`Layer ${id}: ${lowSeverity} low priority issues detected`);
          }
        }
      });
      
      // Ensure dependency order and get minimal set
      const sortedLayers = this.getMinimalLayerSet(Array.from(layers).sort());
      
      return {
        layers: sortedLayers,
        reasons
      };
      
    } catch (error) {
      console.warn(`WARNING: Recommendation generation failed: ${error.message}`);
      return {
        layers: [1, 2, 3, 4],
        reasons: ['Fallback: Using default layer set due to analysis error']
      };
    }
  }
  
  /**
   * Get minimal layer set respecting dependencies
   */
  static getMinimalLayerSet(requestedLayers) {
    const dependencies = {
      1: [],
      2: [1],
      3: [1, 2],
      4: [1, 2, 3],
      5: [1, 2, 3, 4],
      6: [1, 2, 3, 4, 5]
    };
    
    const result = new Set();
    
    requestedLayers.forEach(layerId => {
      // Add dependencies first
      dependencies[layerId].forEach(dep => result.add(dep));
      // Add the layer itself
      result.add(layerId);
    });
    
    return Array.from(result).sort();
  }
  
  /**
   * Detect file type for targeted analysis
   */
  static detectFileType(filePath) {
    if (!filePath) return 'unknown';
    
    const extension = filePath.split('.').pop().toLowerCase();
    
    if (['ts', 'tsx'].includes(extension)) return 'typescript';
    if (['js', 'jsx'].includes(extension)) return 'javascript';
    if (extension === 'json') return 'json';
    if (['test.ts', 'test.tsx', 'spec.ts', 'spec.tsx'].some(ext => filePath.endsWith(ext))) return 'test';
    
    return extension || 'unknown';
  }
  
  /**
   * Check if code represents a React component
   */
  static isReactComponent(code, filePath) {
    if (!code) return false;
    
    try {
      const reactPatterns = [
        /import\s+React/,
        /import\s*{\s*[^}]*\s*}\s*from\s*['"]react['"]/,
        /export\s+(?:default\s+)?function\s+\w+.*return\s*\(/,
        /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\(/,
        /\.tsx?$/.test(filePath || ''),
        /<\w+[^>]*>/
      ];
      
      return reactPatterns.some(pattern => pattern.test(code));
      
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Check if file is Next.js related
   */
  static isNextJsFile(code, filePath) {
    if (!code && !filePath) return false;
    
    try {
      return /next\//.test(code) ||
             /pages\//.test(filePath || '') ||
             /app\//.test(filePath || '') ||
             code.includes('getServerSideProps') ||
             code.includes('getStaticProps');
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Check if file is a test file
   */
  static isTestFile(filePath) {
    if (!filePath) return false;
    
    return /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath) ||
           /__tests__\//.test(filePath);
  }
  
  /**
   * Calculate confidence in recommendations
   */
  static calculateConfidence(issues) {
    try {
      const totalIssues = issues.length;
      const highSeverityCount = issues.filter(i => i.severity === 'high').length;
      
      if (totalIssues === 0) return 0.5; // Neutral confidence when no issues
      
      // Higher confidence when more high-severity issues are detected
      const baseConfidence = 0.6;
      const severityBonus = (highSeverityCount / totalIssues) * 0.3;
      const volumeBonus = Math.min(0.1, totalIssues / 50); // Max 0.1 bonus for volume
      
      return Math.min(0.95, baseConfidence + severityBonus + volumeBonus);
      
    } catch (error) {
      return 0.5;
    }
  }
  
  /**
   * Estimate impact of applying fixes
   */
  static estimateImpact(issues) {
    try {
      const totalIssues = issues.length;
      const criticalCount = issues.filter(i => i.severity === 'high').length;
      const mediumCount = issues.filter(i => i.severity === 'medium').length;
      
      let level, description, estimatedFixTime;
      
      if (criticalCount >= 5) {
        level = 'high';
        description = `${totalIssues} total issues, ${criticalCount} critical`;
        estimatedFixTime = Math.max(60, totalIssues * 15) + ' seconds';
      } else if (criticalCount > 0 || mediumCount >= 3) {
        level = 'medium';
        description = `${totalIssues} total issues, ${criticalCount} critical, ${mediumCount} medium`;
        estimatedFixTime = Math.max(30, totalIssues * 10) + ' seconds';
      } else {
        level = 'low';
        description = `${totalIssues} total issues, mostly minor`;
        estimatedFixTime = Math.max(15, totalIssues * 5) + ' seconds';
      }
      
      return {
        level,
        description,
        estimatedFixTime,
        totalIssues,
        breakdown: {
          critical: criticalCount,
          medium: mediumCount,
          low: totalIssues - criticalCount - mediumCount
        }
      };
      
    } catch (error) {
      return {
        level: 'unknown',
        description: 'Impact estimation failed',
        estimatedFixTime: 'unknown',
        error: error.message
      };
    }
  }
}

module.exports = EnhancedSmartLayerSelector;
