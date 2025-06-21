import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from '../baseAnalyzer';

export class PropTypesDetector extends BaseAnalyzer {;
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

    // Find components without proper TypeScript interfaces or prop types
    const components = this.findReactComponents(sourceFile);

    for (const component of components) {
      if (!this.hasProperTypeDefinition(component, sourceFile)) {
        const componentName = this.getComponentName(component) || 'Component';

        issues.push(this.createIssue(
          'missing-prop-types',
          'warning',
          `Component '${componentName}' lacks proper prop type definitions`,
          fileName,
          component,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 3,
            suggestion: 'Add TypeScript interfaces for better type safety',
            example: 'interface Props { name: string; } const Component: React.FC<Props> = ({ name }) => ...'
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

  private hasProperTypeDefinition(component: ts.Node, sourceFile: ts.SourceFile): boolean {
    // Check if component has TypeScript type annotations
    if (ts.isFunctionDeclaration(component)) {
      return component.parameters.length === 0 || 
             component.parameters.some(param => param.type !== undefined);
    }

    if (ts.isVariableDeclaration(component) && component.initializer) {
      const initializer = component.initializer;
      if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) {
        return initializer.parameters.length === 0 ||
               initializer.parameters.some(param => param.type !== undefined);
      }
    }

    return false;
}}