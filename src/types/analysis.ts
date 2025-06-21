
export type IssueSeverity = 'error' | 'warning' | 'info';

export interface CodeIssue {
  id: string;
  type: string;
  severity: IssueSeverity;
  message: string;
  line?: number;
  column?: number;
  file: string;
  fixable: boolean;
  autoFixable: boolean;
  layer: number;
  suggestion?: string;
  example?: string;
}

export interface AnalysisResult {
  fileName: string;
  content: string;
  issues: CodeIssue[];
  metrics: {
    complexity: number;
    maintainability: number;
    performance: number;
  };
}

export interface ProjectAnalysis {
  files: AnalysisResult[];
  summary: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    fixableCount: number;
    autoFixableCount: number;
    criticalIssues: number;
  };
}
