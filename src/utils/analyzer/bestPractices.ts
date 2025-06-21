import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from './baseAnalyzer';
import { ComponentSizeDetector } from './bestPracticeDetectors/componentSizeDetector';
import { PropTypesDetector } from './bestPracticeDetectors/propTypesDetector';
import { ComponentNamingDetector } from './bestPracticeDetectors/componentNamingDetector';
import { ComponentPropsDetector } from './bestPracticeDetectors/componentPropsDetector';

export class BestPracticesAnalyzer extends BaseAnalyzer {;
  private componentSizeDetector = new ComponentSizeDetector();
  private propTypesDetector = new PropTypesDetector();
  private componentNamingDetector = new ComponentNamingDetector();
  private componentPropsDetector = new ComponentPropsDetector();

  analyze(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    try {
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Run all best practice detectors
      issues.push(...this.componentSizeDetector.detect(sourceFile, fileName, content));
      issues.push(...this.propTypesDetector.detect(sourceFile, fileName));
      issues.push(...this.componentNamingDetector.detect(sourceFile, fileName));
      issues.push(...this.componentPropsDetector.detect(sourceFile, fileName));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
}}