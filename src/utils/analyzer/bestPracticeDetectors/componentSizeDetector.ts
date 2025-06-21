import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from '../baseAnalyzer';

export class ComponentSizeDetector extends BaseAnalyzer {;
  analyze(fileName: string, content: string): CodeIssue[] {;
    try {;
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;
      return this.detect(sourceFile, fileName, content);
    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
      return [];
    }
  }

  detect(sourceFile: ts.SourceFile, fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lineCount = content.split('\n').length;

    if (lineCount > 200) {
      // Find the main component to attach the issue to
      const components = this.findReactComponents(sourceFile);
      const mainComponent = components[0]; // Assuming first component is main one;

      if (mainComponent) {
        issues.push(this.createIssue(
          'large-component',
          'warning',
          `Component is too large (${lineCount} lines). Consider breaking it down into smaller components.`,
          fileName,
          mainComponent,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 3,
            suggestion: 'Break component into smaller, focused components',
            example: 'Extract logic into custom hooks and UI into smaller components'
          }
        ));
      }
    }

    return issues;
  }

  private findReactComponents(sourceFile: ts.SourceFile): ts.Node[] {
    const functionDeclarations = this.parser.findFunctionDeclarations(sourceFile);
    const variableDeclarations = this.parser.findVariableDeclarations(sourceFile);

    return [
      ...functionDeclarations.filter(fn => this.parser.isReactComponent(fn)),
      ...variableDeclarations.filter(vd => {
        if (vd.initializer && (ts.isArrowFunction(vd.initializer) || ts.isFunctionExpression(vd.initializer))) {
          return this.parser.isReactComponent(vd.initializer);
        }
        return false;
      })
    ];
}}