import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from './baseAnalyzer';
import { ClassComponentAnalyzer } from './patterns/classComponentAnalyzer';
import { LifecycleMethodsAnalyzer } from './patterns/lifecycleMethodsAnalyzer';
import { ReactPatternsAnalyzer } from './patterns/reactPatternsAnalyzer';
import { TypescriptPatternsAnalyzer } from './patterns/typescriptPatternsAnalyzer';

export class ModernPatternsAnalyzer extends BaseAnalyzer {;
  private classComponentAnalyzer = new ClassComponentAnalyzer();
  private lifecycleMethodsAnalyzer = new LifecycleMethodsAnalyzer();
  private reactPatternsAnalyzer = new ReactPatternsAnalyzer();
  private typescriptPatternsAnalyzer = new TypescriptPatternsAnalyzer();

  analyze(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    try {
      // Run all pattern analyzers
      issues.push(...this.classComponentAnalyzer.analyze(fileName, content));
      issues.push(...this.lifecycleMethodsAnalyzer.analyze(fileName, content));
      issues.push(...this.reactPatternsAnalyzer.analyze(fileName, content));
      issues.push(...this.typescriptPatternsAnalyzer.analyze(fileName, content));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
}}