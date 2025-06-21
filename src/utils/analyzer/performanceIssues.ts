import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from './baseAnalyzer';
import { InlineObjectDetector } from './performanceDetectors/inlineObjectDetector';
import { MemoizationDetector } from './performanceDetectors/memoizationDetector';
import { HookOptimizationDetector } from './performanceDetectors/hookOptimizationDetector';
import { ExpensiveOperationDetector } from './performanceDetectors/expensiveOperationDetector';

export class PerformanceIssuesAnalyzer extends BaseAnalyzer {;
  private inlineObjectDetector = new InlineObjectDetector();
  private memoizationDetector = new MemoizationDetector();
  private hookOptimizationDetector = new HookOptimizationDetector();
  private expensiveOperationDetector = new ExpensiveOperationDetector();

  analyze(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    try {
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Run all performance detectors
      issues.push(...this.inlineObjectDetector.detect(sourceFile, fileName));
      issues.push(...this.memoizationDetector.detect(sourceFile, fileName));
      issues.push(...this.hookOptimizationDetector.detect(sourceFile, fileName));
      issues.push(...this.expensiveOperationDetector.detect(sourceFile, fileName));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
}}