import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from '../baseAnalyzer';

export class HookOptimizationDetector extends BaseAnalyzer {;
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

    issues.push(...this.findMissingUseCallback(sourceFile, fileName));
    issues.push(...this.findMissingUseMemo(sourceFile, fileName));

    return issues;
  }

  private findMissingUseCallback(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Find function declarations inside React components that could be callbacks
    const components = this.findReactComponents(sourceFile);

    for (const component of components) {
      // Find arrow functions and function expressions inside the component
      const functions = this.findNodesInNode(component, node => ;
        ts.isArrowFunction(node) || ts.isFunctionExpression(node)
      ).filter(fn => fn !== component); // Exclude the component itself

      for (const func of functions) {
        // Check if this function is passed as a prop or used as an event handler
        if (this.isPassedAsCallback(func as ts.ArrowFunction | ts.FunctionExpression)) {
          issues.push(this.createIssue(
            'missing-use-callback',
            'info',
            'Function could be wrapped with useCallback to prevent unnecessary re-renders',
            fileName,
            func,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 2,
              suggestion: 'Wrap function with useCallback hook',
              example: 'const handleClick = useCallback(() => { /* logic */ }, [dependencies]);'
            }
          ));
        }
      }
    }

    return issues;
  }

  private findMissingUseMemo(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Find expensive computations that could benefit from useMemo
    const components = this.findReactComponents(sourceFile);

    for (const component of components) {
      // Look for expensive operations like array methods, object creation, etc.
      const callExpressions = this.findNodesInNode(component, ts.isCallExpression) as ts.CallExpression[];

      for (const call of callExpressions) {
        if (this.isExpensiveOperation(call)) {
          issues.push(this.createIssue(
            'missing-use-memo',
            'info',
            'Expensive computation could be memoized with useMemo',
            fileName,
            call,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 2,
              suggestion: 'Wrap expensive computation with useMemo hook',
              example: 'const expensiveValue = useMemo(() => expensiveComputation(), [dependencies]);'
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
  }

  private isPassedAsCallback(func: ts.ArrowFunction | ts.FunctionExpression): boolean {
    // Check if function is passed as prop or used as event handler
    let parent = func.parent;
    while (parent) {
      if (ts.isJsxAttribute(parent) || ts.isPropertyAssignment(parent)) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }

  private isExpensiveOperation(call: ts.CallExpression): boolean {
    if (ts.isPropertyAccessExpression(call.expression)) {
      const methodName = call.expression.name.text;
      return ['filter', 'map', 'sort', 'reduce', 'find', 'some', 'every'].includes(methodName);
    }
    return false;
}}