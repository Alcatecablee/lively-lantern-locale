
/**
 * Enhanced Smart Layer Selector
 * Analyzes code and recommends appropriate transformation layers
 */

export class EnhancedSmartLayerSelector {
  static analyzeAndRecommend(code: string, filePath?: string) {
    const issues = this.detectIssues(code, filePath);
    const recommendedLayers = this.recommendLayers(issues);
    const confidence = this.calculateConfidence(issues, recommendedLayers);
    const estimatedImpact = this.estimateImpact(issues);

    return {
      detectedIssues: issues,
      recommendedLayers,
      confidence,
      estimatedImpact
    };
  }

  private static detectIssues(code: string, filePath?: string) {
    const issues = [];

    // Layer 1 issues (Configuration)
    if (code.includes('"target": "es5"') || code.includes('reactStrictMode: false')) {
      issues.push({ type: 'config', severity: 'medium', layer: 1 });
    }

    // Layer 2 issues (Patterns)
    if (code.includes('&quot;') || code.includes('&amp;') || /\bvar\s+/.test(code)) {
      issues.push({ type: 'patterns', severity: 'low', layer: 2 });
    }

    // Layer 3 issues (Components)
    if (/\.map\s*\([^)]*\)\s*=>\s*<[^>]+(?![^>]*key=)/.test(code)) {
      issues.push({ type: 'missing-keys', severity: 'high', layer: 3 });
    }

    // Layer 4 issues (Hydration)
    if (/localStorage\.|window\./.test(code) && !code.includes('typeof window')) {
      issues.push({ type: 'ssr-safety', severity: 'high', layer: 4 });
    }

    // Layer 5 issues (Next.js)
    if (code.includes("'use client'") && filePath) {
      const lines = code.split('\n');
      const useClientIndex = lines.findIndex(line => line.trim() === "'use client';");
      if (useClientIndex > 0) {
        issues.push({ type: 'use-client-placement', severity: 'medium', layer: 5 });
      }
    }

    // Layer 6 issues (Testing)
    if (code.includes('export default function') && !code.includes('interface') && code.includes('props')) {
      issues.push({ type: 'missing-prop-types', severity: 'medium', layer: 6 });
    }

    return issues;
  }

  private static recommendLayers(issues: any[]) {
    const layerSet = new Set();
    issues.forEach(issue => layerSet.add(issue.layer));
    return Array.from(layerSet).sort((a, b) => a - b);
  }

  private static calculateConfidence(issues: any[], recommendedLayers: number[]) {
    if (issues.length === 0) return 0.9; // High confidence for no issues
    
    const highSeverityIssues = issues.filter(i => i.severity === 'high').length;
    const totalIssues = issues.length;
    
    return Math.max(0.3, 1 - (highSeverityIssues * 0.2) - (totalIssues * 0.05));
  }

  private static estimateImpact(issues: any[]) {
    const highImpactIssues = issues.filter(i => i.severity === 'high').length;
    
    if (highImpactIssues > 3) return { level: 'high', description: 'Significant improvements expected' };
    if (highImpactIssues > 1) return { level: 'medium', description: 'Moderate improvements expected' };
    return { level: 'low', description: 'Minor improvements expected' };
  }
}
