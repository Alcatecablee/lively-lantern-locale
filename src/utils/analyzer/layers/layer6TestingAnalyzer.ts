import { BaseAnalyzer } from '../baseAnalyzer';
import { CodeIssue } from '@/types/analysis';
/**
 * Layer 6: Testing and Validation Fixes
 * - Test file structure
 * - Testing library patterns
 * - Console statements
 * - Development-only code
 */
export class Layer6TestingAnalyzer extends BaseAnalyzer {
  analyze(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    // Check test files
    if (fileName.includes('.test.') || fileName.includes('.spec.')) {
      issues.push(...this.analyzeTestFile(fileName, content));
    }
    // Check for development-only code in production files
    if (!fileName.includes('test') && !fileName.includes('spec') && !fileName.includes('dev')) {
      issues.push(...this.analyzeProductionFile(fileName, content));
    }
    return issues;
  }
  private analyzeTestFile(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    // Check for missing test structure
    if (!content.includes('describe') && !content.includes('test') && !content.includes('it')) {
      issues.push({
        id: this.generateId('test-structure', fileName, 1, 1, 'Missing test structure'),
        type: 'testing',
        severity: 'warning',
        message: 'Test file should contain describe/test/it blocks',
        line: 1,
        column: 1,
        file: fileName,
        fixable: false,
        autoFixable: false,
        layer: 6,
        suggestion: 'Add proper test structure with describe/test blocks'
      });
    }
    return issues;
  }
  private analyzeProductionFile(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      // Check for console.error/warn that might be okay
      if (line.includes('console.error(') || line.includes('console.warn(')) {
        issues.push({
          id: this.generateId('console-error', fileName, lineNum, 1, 'Console error/warn statement'),
          type: 'production',
          severity: 'info',
          message: 'Console error/warn statement found - ensure this is intentional for production',
          line: lineNum,
          column: line.indexOf('console.') + 1,
          file: fileName,
          fixable: false,
          autoFixable: false,
          layer: 6,
          suggestion: 'Consider using proper error handling or logging service'
        });
      }
      // Check for debugger statements
      if (line.includes('debugger')) {
        issues.push({
          id: this.generateId('debugger-statement', fileName, lineNum, 1, 'Debugger statement'),
          type: 'production',
          severity: 'error',
          message: 'Debugger statement should not be in production code',
          line: lineNum,
          column: line.indexOf('debugger') + 1,
          file: fileName,
          fixable: true,
          autoFixable: true,
          layer: 6,
          suggestion: 'Remove debugger statement',
          example: '// debugger; // Remove this line'
        });
      }
    });
    return issues;
  }
}