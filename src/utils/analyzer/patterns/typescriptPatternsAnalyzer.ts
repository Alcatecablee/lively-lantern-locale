import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from '../baseAnalyzer';

export class TypescriptPatternsAnalyzer extends BaseAnalyzer {;
  analyze(fileName: string, content: string): CodeIssue[] {;
    const issues: CodeIssue[] = [];

    try {
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Check for TypeScript pattern issues
      issues.push(...this.findTypescriptPatternIssues(sourceFile, fileName));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
  }

  private findTypescriptPatternIssues(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Check for any type usage
    const typeReferences = this.parser.findNodes(sourceFile, ts.isTypeReferenceNode) as ts.TypeReferenceNode[];

    for (const typeRef of typeReferences) {
      if (ts.isIdentifier(typeRef.typeName) && typeRef.typeName.text === 'any') {
        issues.push(this.createIssue(
          'typescript-any-type',
          'info',
          'Using "any" type reduces type safety benefits',
          fileName,
          typeRef,
          sourceFile,
          {
            fixable: true,
            autoFixable: true,
            layer: 6,
            suggestion: 'Use specific types instead of "any" for better type safety',
            example: 'Define interfaces or use union types: string | number instead of any'
          }
        ));
      }
    }

    // Check for missing return type annotations on functions
    const functionDeclarations = this.parser.findFunctionDeclarations(sourceFile);

    for (const func of functionDeclarations) {
      if (!func.type && this.parser.isReactComponent(func)) {
        const functionName = func.name?.text || 'Anonymous function';
        issues.push(this.createIssue(
          'missing-return-type',
          'info',
          `Function '${functionName}' missing explicit return type annotation`,
          fileName,
          func,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 6,
            suggestion: 'Add explicit return type annotations for better type safety',
            example: 'const Component = (): JSX.Element => { ... }'
          }
        ));
      }
    }

    return issues;
}}