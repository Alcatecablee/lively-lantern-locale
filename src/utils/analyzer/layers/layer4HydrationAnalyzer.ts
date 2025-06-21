import { BaseAnalyzer } from '../baseAnalyzer';
import { CodeIssue } from '@/types/analysis';
/**
 * Layer 4: Hydration and SSR Fixes
 * - Client-side guards
 * - Theme provider issues
 * - Window/document usage
 * - Dynamic imports
 */
export class Layer4HydrationAnalyzer extends BaseAnalyzer {
  analyze(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    if (!fileName.endsWith('.ts') && !fileName.endsWith('.tsx')) {
      return issues;
    }
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      // Check for window usage without guard
      if (line.includes('window.') && !line.includes('typeof window')) {
        issues.push({
          id: this.generateId('window-usage', fileName, lineNum, 1, 'Window usage without guard'),
          type: 'hydration',
          severity: 'warning',
          message: 'Direct window usage without guard can cause SSR hydration issues',
          line: lineNum,
          column: line.indexOf('window.') + 1,
          file: fileName,
          fixable: true,
          autoFixable: false,
          layer: 4,
          suggestion: 'Add typeof window !== "undefined" guard',
          example: 'if (typeof window !== "undefined") { window.method(); }'
        });
      }
      // Check for document usage without guard
      if (line.includes('document.') && !line.includes('typeof document')) {
        issues.push({
          id: this.generateId('document-usage', fileName, lineNum, 1, 'Document usage without guard'),
          type: 'hydration',
          severity: 'warning',
          message: 'Direct document usage without guard can cause SSR hydration issues',
          line: lineNum,
          column: line.indexOf('document.') + 1,
          file: fileName,
          fixable: true,
          autoFixable: false,
          layer: 4,
          suggestion: 'Add typeof document !== "undefined" guard',
          example: 'if (typeof document !== "undefined") { document.method(); }'
        });
      }
    });
    return issues;
  }
}