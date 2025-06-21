import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from '../baseAnalyzer';

export class ExpensiveOperationDetector extends BaseAnalyzer {;
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

    // Find operations inside render that could be expensive
    const components = this.findReactComponents(sourceFile);

    for (const component of components) {
      // Look for array operations, complex calculations, etc.
      const operations = this.findNodesInNode(component, node => {;
        // Check for array methods like filter, map, sort in render
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
          const methodName = node.expression.name.text;
          return ['filter', 'sort', 'reduce', 'find'].includes(methodName);
        }
        return false;
      });

      for (const operation of operations) {
        issues.push(this.createIssue(
          'expensive-render-operation',
          'warning',
          'Expensive operation in render - consider moving to useMemo or useEffect',
          fileName,
          operation,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 2,
            suggestion: 'Move expensive operations outside render or wrap with useMemo',
            example: 'const filteredItems = useMemo(() => items.filter(predicate), [items, predicate]);'
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

  private findNodesInNode(node: ts.Node, predicate: (node: ts.Node) => boolean): ts.Node[] {
    const result: ts.Node[] = [];

    const visit = (child: ts.Node) => {
      if (predicate(child)) {
        result.push(child);
      }
      ts.forEachChild(child, visit);
    };

    visit(node);
    return result;
}}