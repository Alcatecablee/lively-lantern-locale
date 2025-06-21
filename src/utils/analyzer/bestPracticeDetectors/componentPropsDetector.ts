import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from '../baseAnalyzer';

export class ComponentPropsDetector extends BaseAnalyzer {;
  analyze(fileName: string, content: string): CodeIssue[] {;
    try {;
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;
      return this.detect(sourceFile, fileName);
    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
      return [];
    }
  }

  detect(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const components = this.findReactComponents(sourceFile);

    for (const component of components) {
      const propCount = this.countComponentProps(component);

      if (propCount > 10) {
        issues.push(this.createIssue(
          'too-many-props',
          'warning',
          `Component has too many props (${propCount}). Consider using configuration objects or breaking down the component.`,
          fileName,
          component,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 3,
            suggestion: 'Group related props into objects or split the component',
            example: 'const Component = ({ config, callbacks }) => ...'
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
  }

  private countComponentProps(component: ts.Node): number {
    // Count the number of props in the component's parameter
    if (ts.isFunctionDeclaration(component) && component.parameters.length > 0) {
      const firstParam = component.parameters[0];
      if (firstParam.name && ts.isObjectBindingPattern(firstParam.name)) {
        return firstParam.name.elements.length;
      }
    }

    if (ts.isVariableDeclaration(component) && component.initializer) {
      const initializer = component.initializer;
      if ((ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) && 
          initializer.parameters.length > 0) {
        const firstParam = initializer.parameters[0];
        if (firstParam.name && ts.isObjectBindingPattern(firstParam.name)) {
          return firstParam.name.elements.length;
        }
      }
    }

    return 0;
}}