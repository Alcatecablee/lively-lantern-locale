import { LayerDependencyManager } from '../dependencies/LayerDependencyManager';

/**
 * Intelligent layer selection based on comprehensive code analysis
 * Recommends optimal layer combinations for specific issues
 */
export class SmartLayerSelector {
  
  private static readonly ISSUE_PATTERNS = {
    configuration: [
      { pattern: /"target":\s*"es5"/g, severity: 'high', description: 'Outdated TypeScript target' },
      { pattern: /reactStrictMode:\s*false/g, severity: 'medium', description: 'React strict mode disabled' },
      { pattern: /"skipLibCheck":\s*false/g, severity: 'low', description: 'Unnecessary lib checking enabled' }
    ],
    entities: [
      { pattern: /&quot;/g, severity: 'high', description: 'HTML quote entities' },
      { pattern: /&amp;/g, severity: 'high', description: 'HTML ampersand entities' },
      { pattern: /&lt;|&gt;/g, severity: 'medium', description: 'HTML bracket entities' },
      { pattern: /&#x27;/g, severity: 'medium', description: 'HTML apostrophe entities' },
      { pattern: /console\.log\(/g, severity: 'low', description: 'Console.log statements' }
    ],
    components: [
      { pattern: /\.map\s*\([^)]*\)\s*=>\s*<[^>]*(?!.*key=)/g, severity: 'critical', description: 'Missing key props in map' },
      { pattern: /<img(?![^>]*alt=)[^>]*>/g, severity: 'high', description: 'Images without alt attributes' },
      { pattern: /<button(?![^>]*aria-label)[^>]*>/g, severity: 'medium', description: 'Buttons without accessibility' },
      { pattern: /useState.*(?!.*import.*useState)/g, severity: 'high', description: 'Missing React hook imports' }
    ],
    hydration: [
      { pattern: /localStorage\.(?!.*typeof\s+window)/g, severity: 'critical', description: 'Unguarded localStorage access' },
      { pattern: /window\.(?!.*typeof\s+window)/g, severity: 'critical', description: 'Unguarded window access' },
      { pattern: /document\.(?!.*typeof\s+document)/g, severity: 'high', description: 'Unguarded document access' },
      { pattern: /ThemeProvider.*useState.*(?!.*mounted)/g, severity: 'critical', description: 'Theme provider without hydration protection' }
    ],
    nextjs: [
      { pattern: /import\s*{\s*$|import\s*{\s*\n\s*import/m, severity: 'critical', description: 'Corrupted import statements' },
      { pattern: /'use client';.*\n.*import/g, severity: 'high', description: 'Misplaced use client directive' },
      { pattern: /use(State|Effect).*(?!.*'use client')/g, severity: 'medium', description: 'Missing use client for hooks' }
    ],
    testing: [
      { pattern: /export default function.*props.*(?!.*interface)/g, severity: 'medium', description: 'Missing prop interfaces' },
      { pattern: /async.*(?!.*try.*catch)/g, severity: 'high', description: 'Unhandled async operations' },
      { pattern: /PDF|upload|API.*(?!.*ErrorBoundary|try)/g, severity: 'high', description: 'Risky operations without error handling' }
    ]
  };
  
  /**
   * Analyze code and provide sophisticated layer recommendations
   */
  static analyzeAndRecommend(code: string, filePath?: string): LayerRecommendation {
    const analysis = this.performComprehensiveAnalysis(code, filePath);
    const recommendations = this.generateSophisticatedRecommendations(analysis);
    const riskAssessment = this.assessTransformationRisks(analysis);
    
    return {
      recommendedLayers: recommendations.layers,
      detectedIssues: analysis.issues,
      reasoning: recommendations.reasons,
      confidence: this.calculateSophisticatedConfidence(analysis),
      estimatedImpact: this.estimateDetailedImpact(analysis),
      riskAssessment,
      executionPlan: this.generateExecutionPlan(recommendations.layers, analysis),
      fallbackStrategies: this.generateFallbackStrategies(analysis)
    };
  }
  
  /**
   * Comprehensive code analysis with pattern matching and context awareness
   */
  private static performComprehensiveAnalysis(code: string, filePath?: string): CodeAnalysis {
    const issues: DetectedIssue[] = [];
    const context = this.analyzeCodeContext(code, filePath);
    
    // Analyze each category with sophisticated pattern matching
    Object.entries(this.ISSUE_PATTERNS).forEach(([category, patterns]) => {
      patterns.forEach(patternDef => {
        const matches = code.match(patternDef.pattern);
        if (matches) {
          const contextualSeverity = this.adjustSeverityForContext(
            patternDef.severity, 
            category, 
            context
          );
          
          issues.push({
            type: category,
            severity: contextualSeverity,
            description: patternDef.description,
            count: matches.length,
            pattern: patternDef.pattern.source,
            fixedByLayer: this.getLayerForCategory(category),
            contextualInfo: this.getContextualInfo(category, matches, context),
            estimatedFixComplexity: this.estimateFixComplexity(category, matches.length, context)
          });
        }
      });
    });
    
    return {
      issues,
      context,
      codeMetrics: this.calculateCodeMetrics(code),
      transformationReadiness: this.assessTransformationReadiness(code, issues)
    };
  }
  
  private static generateSophisticatedRecommendations(analysis: CodeAnalysis): {
    layers: number[];
    reasons: string[];
  } {
    const layerScores = new Map<number, number>();
    const reasons: string[] = [];
    
    // Always include layer 1 as foundation
    layerScores.set(1, 1.0);
    reasons.push('Configuration layer provides essential foundation and optimizations');
    
    // Score layers based on detected issues with weighted importance
    analysis.issues.forEach(issue => {
      const layer = issue.fixedByLayer;
      const currentScore = layerScores.get(layer) || 0;
      
      // Calculate weighted score based on severity and context
      const severityWeight = {
        'critical': 1.0,
        'high': 0.8,
        'medium': 0.6,
        'low': 0.3
      }[issue.severity] || 0.1;
      
      const complexityMultiplier = {
        'simple': 1.0,
        'moderate': 1.2,
        'complex': 1.5
      }[issue.estimatedFixComplexity] || 1.0;
      
      const newScore = Math.min(1.0, currentScore + (severityWeight * complexityMultiplier * (issue.count / 10)));
      layerScores.set(layer, newScore);
      
      if (newScore > 0.7) {
        reasons.push(`Layer ${layer}: ${issue.count} ${issue.severity} priority ${issue.description} issues`);
      }
    });
    
    // Select layers with significant scores
    const recommendedLayers = Array.from(layerScores.entries())
      .filter(([_, score]) => score > 0.3)
      .sort(([a], [b]) => a - b)
      .map(([layer]) => layer);
    
    // Validate and correct dependencies
    const corrected = LayerDependencyManager.validateAndCorrectLayers(recommendedLayers);
    
    return {
      layers: corrected.correctedLayers,
      reasons: [...reasons, ...corrected.warnings]
    };
  }
  
  /**
   * Assess transformation risks with sophisticated heuristics
   */
  private static assessTransformationRisks(analysis: CodeAnalysis): RiskAssessment {
    const risks: string[] = [];
    let overallRisk: 'low' | 'medium' | 'high' = 'low';
    
    // Check for high-risk patterns
    const criticalIssues = analysis.issues.filter(i => i.severity === 'critical');
    const complexFixes = analysis.issues.filter(i => i.estimatedFixComplexity === 'complex');
    
    if (criticalIssues.length > 3) {
      risks.push('Multiple critical issues may interact unexpectedly');
      overallRisk = 'high';
    }
    
    if (complexFixes.length > 2) {
      risks.push('Complex transformations may require manual review');
      overallRisk = overallRisk === 'high' ? 'high' : 'medium';
    }
    
    // Check code complexity indicators
    if (analysis.codeMetrics.cyclomaticComplexity > 15) {
      risks.push('High code complexity increases transformation risk');
      overallRisk = overallRisk === 'low' ? 'medium' : overallRisk;
    }
    
    if (analysis.codeMetrics.nestingDepth > 5) {
      risks.push('Deep nesting may complicate AST transformations');
    }
    
    return {
      level: overallRisk,
      factors: risks,
      mitigationStrategies: this.generateMitigationStrategies(risks),
      recommendedApproach: this.recommendTransformationApproach(analysis)
    };
  }
  
  // Add all the missing method implementations
  private static calculateSophisticatedConfidence(analysis: CodeAnalysis): number {
    const totalIssues = analysis.issues.length;
    const criticalIssues = analysis.issues.filter(i => i.severity === 'critical').length;
    
    if (totalIssues === 0) return 0.5;
    
    const baseConfidence = 0.7;
    const criticalWeight = (criticalIssues / totalIssues) * 0.2;
    const readinessWeight = analysis.transformationReadiness * 0.1;
    
    return Math.min(0.95, baseConfidence + criticalWeight + readinessWeight);
  }
  
  private static estimateDetailedImpact(analysis: CodeAnalysis): string {
    const totalIssues = analysis.issues.length;
    const criticalCount = analysis.issues.filter(i => i.severity === 'critical').length;
    
    if (criticalCount > 3) {
      return `High impact: ${totalIssues} issues (${criticalCount} critical) - significant improvements expected`;
    } else if (criticalCount > 0) {
      return `Medium impact: ${totalIssues} issues (${criticalCount} critical) - moderate improvements expected`;
    } else {
      return `Low impact: ${totalIssues} issues - minor improvements expected`;
    }
  }
  
  private static adjustSeverityForContext(
    severity: string, 
    category: string, 
    context: CodeContext
  ): 'critical' | 'high' | 'medium' | 'low' {
    // Adjust severity based on context
    if (category === 'hydration' && context.isNextjsApp) {
      return severity === 'high' ? 'critical' : severity as any;
    }
    
    if (category === 'components' && context.isReactComponent) {
      return severity === 'medium' ? 'high' : severity as any;
    }
    
    return severity as any;
  }
  
  private static getContextualInfo(category: string, matches: RegExpMatchArray, context: CodeContext): any {
    return {
      category,
      matchCount: matches.length,
      contextType: context.isReactComponent ? 'react' : context.isNextjsApp ? 'nextjs' : 'general'
    };
  }
  
  private static estimateFixComplexity(
    category: string, 
    matchCount: number, 
    context: CodeContext
  ): 'simple' | 'moderate' | 'complex' {
    if (matchCount > 10) return 'complex';
    if (matchCount > 5) return 'moderate';
    if (context.complexity > 20) return 'complex';
    return 'simple';
  }
  
  private static assessTransformationReadiness(code: string, issues: DetectedIssue[]): number {
    const syntaxValid = !code.includes('SyntaxError');
    const lowErrorCount = issues.length < 10;
    const noCriticalStructuralIssues = !issues.some(i => i.type === 'structural' && i.severity === 'critical');
    
    let readiness = 0.5;
    if (syntaxValid) readiness += 0.2;
    if (lowErrorCount) readiness += 0.2;
    if (noCriticalStructuralIssues) readiness += 0.1;
    
    return Math.min(1.0, readiness);
  }
  
  private static generateMitigationStrategies(risks: string[]): string[] {
    const strategies: string[] = [];
    
    if (risks.some(r => r.includes('complexity'))) {
      strategies.push('Use incremental layer execution');
    }
    
    if (risks.some(r => r.includes('critical'))) {
      strategies.push('Enable comprehensive validation');
    }
    
    strategies.push('Create backup before transformation');
    
    return strategies;
  }
  
  private static recommendTransformationApproach(analysis: CodeAnalysis): 'conservative' | 'standard' | 'aggressive' {
    const criticalIssues = analysis.issues.filter(i => i.severity === 'critical').length;
    const complexity = analysis.codeMetrics.cyclomaticComplexity;
    
    if (criticalIssues > 5 || complexity > 20) return 'conservative';
    if (criticalIssues > 2 || complexity > 10) return 'standard';
    return 'aggressive';
  }
  
  private static generateExecutionPlan(layers: number[], analysis: CodeAnalysis): ExecutionPlan {
    const steps: ExecutionStep[] = layers.map((layerId, index) => ({
      layerId,
      order: index + 1,
      estimatedDuration: this.estimateLayerExecutionTime(layerId, analysis.issues),
      riskLevel: this.assessLayerRisk(layerId, analysis.issues),
      validationChecks: this.getValidationChecksForLayer(layerId),
      rollbackStrategy: this.getRollbackStrategyForLayer(layerId),
      successCriteria: this.getSuccessCriteriaForLayer(layerId, analysis.issues)
    }));
    
    return {
      steps,
      totalEstimatedTime: steps.reduce((sum, step) => sum + step.estimatedDuration, 0),
      criticalPath: this.identifyCriticalPath(steps),
      parallelizationOptions: this.identifyParallelizationOptions(steps)
    };
  }
  
  // Helper method implementations
  private static estimateLayerExecutionTime(layerId: number, issues: DetectedIssue[]): number {
    const baseTime = 100; // Base execution time in ms
    const relevantIssues = issues.filter(i => i.fixedByLayer === layerId);
    return baseTime + (relevantIssues.length * 50);
  }
  
  private static assessLayerRisk(layerId: number, issues: DetectedIssue[]): 'low' | 'medium' | 'high' {
    const relevantIssues = issues.filter(i => i.fixedByLayer === layerId);
    const criticalCount = relevantIssues.filter(i => i.severity === 'critical').length;
    
    if (criticalCount > 2) return 'high';
    if (criticalCount > 0) return 'medium';
    return 'low';
  }
  
  private static getValidationChecksForLayer(layerId: number): string[] {
    const checks = {
      1: ['Syntax validation', 'Config structure check'],
      2: ['Entity conversion accuracy', 'Pattern integrity'],
      3: ['JSX structure validation', 'Component prop validation'],
      4: ['SSR guard placement', 'Runtime safety check'],
      5: ['Next.js directive placement', 'Import structure'],
      6: ['Test structure validation', 'Async pattern check']
    };
    
    return checks[layerId as keyof typeof checks] || ['Basic validation'];
  }
  
  private static getRollbackStrategyForLayer(layerId: number): string {
    return `Automatic rollback to pre-layer-${layerId} state on validation failure`;
  }
  
  private static getSuccessCriteriaForLayer(layerId: number, issues: DetectedIssue[]): string[] {
    const relevantIssues = issues.filter(i => i.fixedByLayer === layerId);
    return relevantIssues.map(issue => `Fix ${issue.description}`);
  }
  
  private static identifyCriticalPath(steps: ExecutionStep[]): number[] {
    return steps
      .filter(step => step.riskLevel === 'high')
      .map(step => step.layerId);
  }
  
  private static identifyParallelizationOptions(steps: ExecutionStep[]): string[] {
    return ['Sequential execution recommended for safety'];
  }
  
  // Helper methods for sophisticated analysis
  private static analyzeCodeContext(code: string, filePath?: string): CodeContext {
    return {
      isReactComponent: /export\s+(?:default\s+)?function.*\(.*\).*{[\s\S]*return[\s\S]*</.test(code),
      isTypeScript: filePath?.endsWith('.ts') || filePath?.endsWith('.tsx') || code.includes('interface ') || code.includes('type '),
      isNextjsApp: code.includes("'use client'") || code.includes('next/') || filePath?.includes('/app/'),
      hasHooks: /use(State|Effect|Context|Reducer|Callback|Memo)/.test(code),
      hasAsyncOperations: code.includes('async ') || code.includes('await '),
      complexity: this.calculateCodeComplexity(code),
      fileSize: code.length,
      lineCount: code.split('\n').length
    };
  }
  
  private static calculateCodeMetrics(code: string): CodeMetrics {
    const lines = code.split('\n');
    
    return {
      lineCount: lines.length,
      cyclomaticComplexity: this.calculateCyclomaticComplexity(code),
      nestingDepth: this.calculateNestingDepth(code),
      functionCount: (code.match(/function\s+\w+|=>\s*{|\w+\s*=\s*\(/g) || []).length,
      importCount: (code.match(/^import\s+/gm) || []).length
    };
  }
  
  private static calculateCodeComplexity(code: string): number {
    const complexityIndicators = [
      /if\s*\(/g, /for\s*\(/g, /while\s*\(/g, /switch\s*\(/g,
      /function\s*\(/g, /=>\s*{/g, /try\s*{/g, /catch\s*\(/g
    ];
    
    return complexityIndicators.reduce((complexity, pattern) => {
      const matches = code.match(pattern);
      return complexity + (matches ? matches.length : 0);
    }, 1);
  }
  
  private static calculateCyclomaticComplexity(code: string): number {
    const complexityPatterns = [
      /if\s*\(/g, /else\s+if/g, /while\s*\(/g, /for\s*\(/g, 
      /switch\s*\(/g, /case\s+/g, /catch\s*\(/g, /&&/g, /\|\|/g
    ];
    
    return complexityPatterns.reduce((complexity, pattern) => {
      const matches = code.match(pattern);
      return complexity + (matches ? matches.length : 0);
    }, 1);
  }
  
  private static calculateNestingDepth(code: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const char of code) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }
    
    return maxDepth;
  }
  
  private static getLayerForCategory(category: string): number {
    const mapping: Record<string, number> = {
      'configuration': 1,
      'entities': 2,
      'components': 3,
      'hydration': 4,
      'nextjs': 5,
      'testing': 6
    };
    return mapping[category] || 1;
  }
  
  private static generateFallbackStrategies(analysis: CodeAnalysis): FallbackStrategy[] {
    const strategies: FallbackStrategy[] = [];
    
    if (analysis.transformationReadiness < 0.7) {
      strategies.push({
        trigger: 'Low transformation readiness',
        action: 'Use regex-only transformations',
        description: 'Disable AST parsing for complex code structures'
      });
    }
    
    if (analysis.issues.some(i => i.severity === 'critical')) {
      strategies.push({
        trigger: 'Critical issues detected',
        action: 'Incremental layer execution',
        description: 'Execute layers one at a time with validation'
      });
    }
    
    return strategies;
  }
}

// Type definitions for sophisticated analysis
export interface LayerRecommendation {
  recommendedLayers: number[];
  detectedIssues: DetectedIssue[];
  reasoning: string[];
  confidence: number;
  estimatedImpact: string;
  riskAssessment: RiskAssessment;
  executionPlan: ExecutionPlan;
  fallbackStrategies: FallbackStrategy[];
}

export interface DetectedIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  count: number;
  pattern: string;
  fixedByLayer: number;
  contextualInfo: any;
  estimatedFixComplexity: 'simple' | 'moderate' | 'complex';
}

export interface CodeAnalysis {
  issues: DetectedIssue[];
  context: CodeContext;
  codeMetrics: CodeMetrics;
  transformationReadiness: number;
}

export interface CodeContext {
  isReactComponent: boolean;
  isTypeScript: boolean;
  isNextjsApp: boolean;
  hasHooks: boolean;
  hasAsyncOperations: boolean;
  complexity: number;
  fileSize: number;
  lineCount: number;
}

export interface CodeMetrics {
  lineCount: number;
  cyclomaticComplexity: number;
  nestingDepth: number;
  functionCount: number;
  importCount: number;
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  mitigationStrategies: string[];
  recommendedApproach: 'conservative' | 'standard' | 'aggressive';
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  totalEstimatedTime: number;
  criticalPath: number[];
  parallelizationOptions: string[];
}

export interface ExecutionStep {
  layerId: number;
  order: number;
  estimatedDuration: number;
  riskLevel: 'low' | 'medium' | 'high';
  validationChecks: string[];
  rollbackStrategy: string;
  successCriteria: string[];
}

export interface FallbackStrategy {
  trigger: string;
  action: string;
  description: string;
}
