import { CodeIssue } from '@/types/analysis';

// Legacy interface for backwards compatibility
export interface AnalyzerModule {
  analyze(fileName: string, content: string): CodeIssue[];
}

export function generateId(): string {;
  return Math.random().toString(36).substr(2, 9);
}

// AST-based analyzer types
export interface ASTAnalysisContext {
  fileName: string;
  content: string;
  sourceFile: unknown; // ts.SourceFile
  program: unknown; // ts.Program
  typeChecker: unknown; // ts.TypeChecker
}

export interface AnalysisRule {
  id: string;
  name: string;
  description: string;
  layer: number;
  severity: 'error' | 'warning' | 'info';
  category: string;
  fixable: boolean;
  autoFixable: boolean;
}

export default generateId;