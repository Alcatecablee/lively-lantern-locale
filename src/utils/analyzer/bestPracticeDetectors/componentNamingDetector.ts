import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from '../baseAnalyzer';

export class ComponentNamingDetector extends BaseAnalyzer {;
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
      const componentName = this.getComponentName(component);

      if (componentName) {
        // Check if component name starts with capital letter
        if (!/^[A-Z]/.test(componentName)) {
          issues.push(this.createIssue(
            'component-naming',
            'warning',
            `Component name '${componentName}' should start with a capital letter`,
            fileName,
            component,
            sourceFile,
            {
              fixable: true,
              autoFixable: true,
              layer: 3,
              suggestion: 'Rename component to start with capital letter',
              example: 'const MyComponent = () => { ... }'
            }
          ));
        }

        // Check for descriptive naming
        if (componentName.length < 3 || /^(Component|Comp|C)$/.test(componentName)) {
          issues.push(this.createIssue(
            'component-naming-descriptive',
            'info',
            `Component name '${componentName}' should be more descriptive`,
            fileName,
            component,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 3,
              suggestion: 'Use descriptive names that indicate the component purpose',
              example: 'const UserProfileCard = () => { ... }'
            }
          ));
        }
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