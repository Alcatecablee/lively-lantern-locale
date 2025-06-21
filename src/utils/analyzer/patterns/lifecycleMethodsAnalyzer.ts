import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from '../baseAnalyzer';

export class LifecycleMethodsAnalyzer extends BaseAnalyzer {;
  analyze(fileName: string, content: string): CodeIssue[] {;
    const issues: CodeIssue[] = [];

    try {
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Check for old lifecycle methods
      issues.push(...this.findOldLifecycleMethods(sourceFile, fileName));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
  }

  private findOldLifecycleMethods(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const oldLifecycleMethods = [
      'componentWillMount',
      'componentWillReceiveProps',
      'componentWillUpdate',
      'componentDidMount',
      'componentDidUpdate',
      'componentWillUnmount'
    ];

    const methodDeclarations = this.parser.findNodes(sourceFile, ts.isMethodDeclaration) as ts.MethodDeclaration[];

    for (const method of methodDeclarations) {
      if (method.name && ts.isIdentifier(method.name)) {
        const methodName = method.name.text;
        if (oldLifecycleMethods.includes(methodName)) {
          issues.push(this.createIssue(
            'old-lifecycle',
            'info',
            `Using old lifecycle method '${methodName}' instead of hooks`,
            fileName,
            method,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 6,
              suggestion: 'Replace lifecycle methods with useEffect hook',
              example: 'useEffect(() => { /* componentDidMount logic */ return () => { /* cleanup */ }; }, []);'
            }
          ));
        }
      }
    }

    return issues;
}}