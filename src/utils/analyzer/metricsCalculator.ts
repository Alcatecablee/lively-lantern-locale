import { CodeIssue } from '@/types/analysis';

export function calculateMetrics(content: string, issues: CodeIssue[]) {;
  const lines = content.split('\n').length;
  const fileSize = content.length;

  // Calculate complexity score based on various factors
  const complexityScore = calculateComplexityScore(content, issues, lines);

  // Calculate maintainability score
  const maintainabilityScore = calculateMaintainabilityScore(content, issues, lines);

  // Calculate performance score
  const performanceScore = calculatePerformanceScore(content, issues);

  return {
    complexity: Math.round(complexityScore),
    maintainability: Math.round(maintainabilityScore),
    performance: Math.round(performanceScore)
  };
}

function calculateComplexityScore(content: string, issues: CodeIssue[], lines: number): number {
  let score = 100;

  // Penalize based on critical issues
  const criticalIssues = issues.filter(i => i.severity === 'error');
  score -= criticalIssues.length * 15;

  // Penalize based on complexity-related issues
  const complexityIssues = issues.filter(i => ;
    i.type.includes('complexity') || 
    i.type.includes('nesting') || 
    i.type.includes('parameter')
  );
  score -= complexityIssues.length * 10;

  // File size penalty
  if (lines > 500) {
    score -= Math.min(30, (lines - 500) / 20);
  }

  // Function count heuristic
  const functionCount = (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
  if (functionCount > 20) {
    score -= Math.min(20, (functionCount - 20) * 2);
  }

  return Math.max(0, Math.min(100, score));
}

function calculateMaintainabilityScore(content: string, issues: CodeIssue[], lines: number): number {
  let score = 100;

  // Penalize all issues with different weights
  const errorWeight = 12;
  const warningWeight = 6;
  const infoWeight = 2;

  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const infos = issues.filter(i => i.severity === 'info').length;

  score -= errors * errorWeight;
  score -= warnings * warningWeight;
  score -= infos * infoWeight;

  // Code quality factors
  const duplicateIssues = issues.filter(i => i.type.includes('duplicate')).length;
  score -= duplicateIssues * 8;

  const namingIssues = issues.filter(i => i.type.includes('naming')).length;
  score -= namingIssues * 4;

  // Documentation heuristic
  const commentLines = (content.match(/^\s*\/\/|^\s*\/\*|\*\//gm) || []).length;
  const commentRatio = commentLines / lines;
  if (commentRatio < 0.05) { // Less than 5% comments
    score -= 10;
  }

  // TypeScript usage bonus
  if (content.includes('interface ') || content.includes('type ') || content.includes(': ')) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

function calculatePerformanceScore(content: string, issues: CodeIssue[]): number {
  let score = 100;

  // Performance-specific issues
  const performanceIssues = issues.filter(i => ;
    i.layer === 2 || 
    i.type.includes('performance') || 
    i.type.includes('memo') || 
    i.type.includes('callback') || 
    i.type.includes('render')
  );
  score -= performanceIssues.length * 8;

  // Memory leak issues
  const memoryIssues = issues.filter(i => i.type.includes('memory') || i.type.includes('leak'));
  score -= memoryIssues.length * 15;

  // Bundle size issues
  const bundleIssues = issues.filter(i => i.type.includes('bundle') || i.type.includes('import'));
  score -= bundleIssues.length * 5;

  // Inline object/function penalties
  const inlineIssues = issues.filter(i => i.type.includes('inline'));
  score -= inlineIssues.length * 6;

  // React best practices bonus
  const usesMemo = content.includes('useMemo');
  const usesCallback = content.includes('useCallback');
  const usesMemoization = content.includes('React.memo');

  if (usesMemo) score += 3;
  if (usesCallback) score += 3;
  if (usesMemoization) score += 4;

  // Modern patterns bonus
  const usesHooks = content.includes('useState') || content.includes('useEffect');
  if (usesHooks) score += 5;

  return Math.max(0, Math.min(100, score));
}

export function calculateProjectHealthScore(issues: CodeIssue[]): {;
  overall: number;
  security: number;
  performance: number;
  maintainability: number;
  accessibility: number;
} {
  const totalIssues = issues.length;
  const criticalIssues = issues.filter(i => i.severity === 'error').length;
  const securityIssues = issues.filter(i => i.type.includes('security') || i.type.includes('xss') || i.type.includes('eval')).length;
  const performanceIssues = issues.filter(i => i.layer === 2).length;
  const accessibilityIssues = issues.filter(i => i.layer === 5).length;

  const security = Math.max(0, 100 - (securityIssues * 20));
  const performance = Math.max(0, 100 - (performanceIssues * 8));
  const maintainability = Math.max(0, 100 - (totalIssues * 4));
  const accessibility = Math.max(0, 100 - (accessibilityIssues * 10));

  const overall = Math.round((security + performance + maintainability + accessibility) / 4);

  return {
    overall,
    security: Math.round(security),
    performance: Math.round(performance),
    maintainability: Math.round(maintainability),
    accessibility: Math.round(accessibility)
  };
}

export default calculateMetrics;