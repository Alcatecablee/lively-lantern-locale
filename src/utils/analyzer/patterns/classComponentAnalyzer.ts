import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from '../baseAnalyzer';

export class ClassComponentAnalyzer extends BaseAnalyzer {;
  analyze(fileName: string, content: string): CodeIssue[] {;
    const issues: CodeIssue[] = [];

    try {
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Check for class components
      issues.push(...this.findClassComponents(sourceFile, fileName));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
  }

  private findClassComponents(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const classDeclarations = this.parser.findNodes(sourceFile, ts.isClassDeclaration) as ts.ClassDeclaration[];

    for (const classDecl of classDeclarations) {
      // Check if it's a React component class
      if (this.isReactComponentClass(classDecl)) {
        const className = classDecl.name?.text || 'Component';
        issues.push(this.createIssue(
          'class-component',
          'info',
          `Consider migrating class component '${className}' to functional component with hooks`,
          fileName,
          classDecl,
          sourceFile,
          {
            fixable: true,
            autoFixable: true,
            layer: 6,
            suggestion: 'Convert to functional component using hooks for better performance and readability',
            example: 'const Component = () => { const [state, setState] = useState(); ... }'
          }
        ));
      }
    }

    return issues;
  }

  private isReactComponentClass(classDecl: ts.ClassDeclaration): boolean {
    if (!classDecl.heritageClauses) return false;

    for (const heritage of classDecl.heritageClauses) {
      for (const type of heritage.types) {
        if (ts.isIdentifier(type.expression)) {
          const className = type.expression.text;
          if (className.includes('Component') || className.includes('PureComponent')) {
            return true;
          }
        }
        if (ts.isPropertyAccessExpression(type.expression)) {
          const propertyName = type.expression.name.text;
          if (propertyName === 'Component' || propertyName === 'PureComponent') {
            return true;
          }
        }
      }
    }

    return false;