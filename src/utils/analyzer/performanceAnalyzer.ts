import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from './baseAnalyzer';

export class PerformanceAnalyzer extends BaseAnalyzer {;
  analyze(fileName: string, content: string): CodeIssue[] {;
    const issues: CodeIssue[] = [];

    try {
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Check for bundle size issues
      issues.push(...this.findBundleSizeIssues(sourceFile, fileName));

      // Check for unnecessary re-renders
      issues.push(...this.findUnnecessaryReRenders(sourceFile, fileName));

      // Check for prop drilling
      issues.push(...this.findPropDrilling(sourceFile, fileName));

      // Check for unused imports
      issues.push(...this.findUnusedImports(sourceFile, fileName));

      // Check for heavy computations in render
      issues.push(...this.findHeavyComputationsInRender(sourceFile, fileName));

      // Check for memory leaks
      issues.push(...this.findMemoryLeaks(sourceFile, fileName));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
  }

  private findBundleSizeIssues(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const imports = this.parser.findImportDeclarations(sourceFile);
    const heavyLibraries = ['lodash', 'moment', 'rxjs', 'antd', '@material-ui/core'];

    for (const importDecl of imports) {
      if (ts.isStringLiteral(importDecl.moduleSpecifier)) {
        const moduleName = importDecl.moduleSpecifier.text;

        // Check for heavy library imports
        if (heavyLibraries.some(lib => moduleName.includes(lib))) {
          // Check if it's a default import of the whole library
          if (importDecl.importClause && !importDecl.importClause.namedBindings) {
            issues.push(this.createIssue(
              'heavy-library-import',
              'warning',
              `Importing entire ${moduleName} library increases bundle size`,
              fileName,
              importDecl,
              sourceFile,
              {
                fixable: true,
                autoFixable: true,
                layer: 2,
                suggestion: 'Import only specific functions you need',
                example: `import { debounce } from 'lodash'; // instead of import _ from 'lodash';`
              }
            ));
          }
        }

        // Check for wildcard imports
        if (importDecl.importClause?.namedBindings && 
            ts.isNamespaceImport(importDecl.importClause.namedBindings)) {
          issues.push(this.createIssue(
            'wildcard-import',
            'info',
            'Wildcard imports can increase bundle size',
            fileName,
            importDecl,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 2,
              suggestion: 'Import only specific exports you need',
              example: 'import { useState, useEffect } from "react"; // instead of import * as React'
            }
          ));
        }
      }
    }

    return issues;
  }

  private findUnnecessaryReRenders(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Find components that don't use React.memo but should
    const components = this.findReactComponents(sourceFile);

    for (const component of components) {
      const componentName = this.getComponentName(component) || 'Component';

      // Check if component has props but no memo
      if (this.hasProps(component) && !this.isMemoed(component, sourceFile)) {
        // Check if component is likely to re-render unnecessarily
        if (this.hasComplexProps(component) || this.isInList(component)) {
          issues.push(this.createIssue(
            'unnecessary-rerender',
            'warning',
            `Component '${componentName}' may re-render unnecessarily - consider React.memo`,
            fileName,
            component,
            sourceFile,
            {
              fixable: true,
              autoFixable: true,
              layer: 2,
              suggestion: 'Wrap component with React.memo to prevent unnecessary re-renders',
              example: 'export default React.memo(Component);'
            }
          ));
        }
      }

      // Check for inline object/array creation in props
      this.findInlineObjectsInProps(component, issues, fileName, sourceFile);
    }

    return issues;
  }

  private findPropDrilling(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const components = this.findReactComponents(sourceFile);

    for (const component of components) {
      const propCount = this.countProps(component);
      const passThroughProps = this.countPassThroughProps(component);

      if (propCount > 5 && passThroughProps > 3) {
        issues.push(this.createIssue(
          'prop-drilling',
          'warning',
          `Component has ${passThroughProps} pass-through props - consider using Context or state management`,
          fileName,
          component,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 2,
            suggestion: 'Use React Context, Redux, or Zustand for shared state',
            example: 'const MyContext = createContext(); // Share data without prop drilling'
          }
        ));
      }
    }

    return issues;
  }

  private findUnusedImports(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const imports = this.parser.findImportDeclarations(sourceFile);
    const sourceText = sourceFile.getText();

    for (const importDecl of imports) {
      if (importDecl.importClause?.namedBindings && ts.isNamedImports(importDecl.importClause.namedBindings)) {
        const namedImports = importDecl.importClause.namedBindings.elements;

        for (const namedImport of namedImports) {
          const importName = namedImport.name.text;
          const regex = new RegExp(`\\b${importName}\\b`, 'g');
          const matches = sourceText.match(regex);

          // If only mentioned once (in the import), it's unused
          if (!matches || matches.length <= 1) {
            issues.push(this.createIssue(
              'unused-import',
              'info',
              `Unused import: ${importName}`,
              fileName,
              namedImport,
              sourceFile,
              {
                fixable: true,
                autoFixable: true,
                layer: 2,
                suggestion: 'Remove unused imports to reduce bundle size',
                example: 'Remove the unused import statement'
              }
            ));
          }
        }
      }
    }

    return issues;
  }

  private findHeavyComputationsInRender(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const components = this.findReactComponents(sourceFile);

    for (const component of components) {
      // Look for expensive operations in component body
      const callExpressions = this.findCallExpressionsInNode(component);

      for (const call of callExpressions) {
        if (this.isExpensiveOperation(call)) {
          const operationName = this.getOperationName(call);
          issues.push(this.createIssue(
            'heavy-computation-render',
            'warning',
            `Heavy computation '${operationName}' in render - consider useMemo`,
            fileName,
            call,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 2,
              suggestion: 'Move expensive computations to useMemo or useCallback',
              example: 'const result = useMemo(() => expensiveOperation(), [dependencies]);'
            }
          ));
        }
      }

      // Check for array operations that should be memoized
      this.findArrayOperationsInRender(component, issues, fileName, sourceFile);
    }

    return issues;
  }

  private findMemoryLeaks(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const useEffectCalls = this.findUseEffectCalls(sourceFile);

    for (const useEffect of useEffectCalls) {
      const hasCleanup = this.hasCleanupFunction(useEffect);
      const hasEventListeners = this.hasEventListeners(useEffect);
      const hasTimers = this.hasTimers(useEffect);
      const hasSubscriptions = this.hasSubscriptions(useEffect);

      if ((hasEventListeners || hasTimers || hasSubscriptions) && !hasCleanup) {
        issues.push(this.createIssue(
          'memory-leak',
          'error',
          'useEffect with side effects missing cleanup function - potential memory leak',
          fileName,
          useEffect,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 2,
            suggestion: 'Add cleanup function to remove event listeners, clear timers, and unsubscribe',
            example: 'useEffect(() => { const id = setInterval(...); return () => clearInterval(id); }, []);'
          }
        ));
      }
    }

    return issues;
  }

  // Helper methods
  private findReactComponents(sourceFile: ts.SourceFile): ts.Node[] {
    return [
      ...this.parser.findFunctionDeclarations(sourceFile).filter(fn => this.parser.isReactComponent(fn)),
      ...this.parser.findVariableDeclarations(sourceFile).filter(vd => {
        if (vd.initializer && (ts.isArrowFunction(vd.initializer) || ts.isFunctionExpression(vd.initializer))) {
          return this.parser.isReactComponent(vd.initializer);
        }
        return false;
      })
    ];
  }

  private hasProps(component: ts.Node): boolean {
    if (ts.isFunctionDeclaration(component)) {
      return component.parameters.length > 0;
    }
    if (ts.isVariableDeclaration(component) && component.initializer) {
      const init = component.initializer;
      if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
        return init.parameters.length > 0;
      }
    }
    return false;
  }

  private isMemoed(component: ts.Node, sourceFile: ts.SourceFile): boolean {
    // Check if component is wrapped with React.memo
    const text = sourceFile.getText();
    const componentName = this.getComponentName(component);
    if (componentName) {
      return text.includes(`React.memo(${componentName})`) || text.includes(`memo(${componentName})`);
    }
    return false;
  }

  private hasComplexProps(component: ts.Node): boolean {
    const propCount = this.countProps(component);
    return propCount > 3;
  }

  private isInList(component: ts.Node): boolean {
    // Check if component is likely used in lists
    let parent = component.parent;
    while (parent) {
      if (ts.isCallExpression(parent) && ts.isPropertyAccessExpression(parent.expression)) {
        if (parent.expression.name.text === 'map') {
          return true;
        }
      }
      parent = parent.parent;
    }
    return false;
  }

  private findInlineObjectsInProps(component: ts.Node, issues: CodeIssue[], fileName: string, sourceFile: ts.SourceFile): void {
    const jsxElements = this.findJSXInNode(component);

    for (const element of jsxElements) {
      const attributes = element.kind === ts.SyntaxKind.JsxElement 
        ? element.openingElement.attributes 
        : element.attributes;

      for (const attr of attributes.properties) {
        if (ts.isJsxAttribute(attr) && attr.initializer && ts.isJsxExpression(attr.initializer)) {
          const expr = attr.initializer.expression;
          if (expr && (ts.isObjectLiteralExpression(expr) || ts.isArrayLiteralExpression(expr))) {
            issues.push(this.createIssue(
              'inline-object-prop',
              'warning',
              'Inline object/array in prop causes unnecessary re-renders',
              fileName,
              attr,
              sourceFile,
              {
                fixable: true,
                autoFixable: true,
                layer: 2,
                suggestion: 'Move object/array outside component or use useMemo',
                example: 'const style = useMemo(() => ({ color: "red" }), []); <div style={style} />'
              }
            ));
          }
        }
      }
    }
  }

  private countProps(component: ts.Node): number {
    if (ts.isFunctionDeclaration(component) && component.parameters[0]) {
      const param = component.parameters[0];
      if (param.name && ts.isObjectBindingPattern(param.name)) {
        return param.name.elements.length;
      }
    }
    if (ts.isVariableDeclaration(component) && component.initializer) {
      const init = component.initializer;
      if ((ts.isArrowFunction(init) || ts.isFunctionExpression(init)) && init.parameters[0]) {
        const param = init.parameters[0];
        if (param.name && ts.isObjectBindingPattern(param.name)) {
          return param.name.elements.length;
        }
      }
    }
    return 0;
  }

  private countPassThroughProps(component: ts.Node): number {
    // Count props that are passed down to child components without being used
    const componentText = component.getText();
    const propPattern = /\{\.\.\.(\w+)\}/g;
    const matches = componentText.match(propPattern);
    return matches ? matches.length : 0;
  }

  private findCallExpressionsInNode(node: ts.Node): ts.CallExpression[] {
    const result: ts.CallExpression[] = [];

    const visit = (child: ts.Node) => {
      if (ts.isCallExpression(child)) {
        result.push(child);
      }
      ts.forEachChild(child, visit);
    };

    visit(node);
    return result;
  }

  private isExpensiveOperation(call: ts.CallExpression): boolean {
    if (ts.isPropertyAccessExpression(call.expression)) {
      const methodName = call.expression.name.text;
      return ['sort', 'filter', 'reduce', 'find', 'findIndex', 'some', 'every'].includes(methodName);
    }

    if (ts.isIdentifier(call.expression)) {
      const funcName = call.expression.text;
      return ['JSON.parse', 'JSON.stringify', 'parseInt', 'parseFloat'].includes(funcName);
    }

    return false;
  }

  private getOperationName(call: ts.CallExpression): string {
    if (ts.isPropertyAccessExpression(call.expression)) {
      return call.expression.name.text;
    }
    if (ts.isIdentifier(call.expression)) {
      return call.expression.text;
    }
    return 'unknown operation';
  }

  private findArrayOperationsInRender(component: ts.Node, issues: CodeIssue[], fileName: string, sourceFile: ts.SourceFile): void {
    const callExpressions = this.findCallExpressionsInNode(component);

    for (const call of callExpressions) {
      if (ts.isPropertyAccessExpression(call.expression)) {
        const methodName = call.expression.name.text;
        if (['sort', 'filter', 'reduce'].includes(methodName)) {
          issues.push(this.createIssue(
            'array-operation-render',
            'info',
            `Array.${methodName}() in render - consider useMemo for performance`,
            fileName,
            call,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 2,
              suggestion: 'Wrap array operations in useMemo to avoid recalculation on every render',
              example: `const sorted = useMemo(() => items.${methodName}(...), [items]);`
            }
          ));
        }
      }
    }
  }

  private findUseEffectCalls(sourceFile: ts.SourceFile): ts.CallExpression[] {
    return this.parser.findCallExpressions(sourceFile).filter(call => {
      return ts.isIdentifier(call.expression) && call.expression.text === 'useEffect';
    });
  }

  private hasCleanupFunction(useEffect: ts.CallExpression): boolean {
    if (useEffect.arguments[0]) {
      const callback = useEffect.arguments[0];
      if (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) {
        const body = callback.body;
        if (ts.isBlock(body)) {
          // Look for return statement with function
          const returnStatements = body.statements.filter(ts.isReturnStatement);
          return returnStatements.some(ret => ret.expression && 
            (ts.isArrowFunction(ret.expression) || ts.isFunctionExpression(ret.expression)));
        }
      }
    }
    return false;
  }

  private hasEventListeners(useEffect: ts.CallExpression): boolean {
    const text = useEffect.getText();
    return text.includes('addEventListener') || text.includes('on(') || text.includes('.on ');
  }

  private hasTimers(useEffect: ts.CallExpression): boolean {
    const text = useEffect.getText();
    return text.includes('setTimeout') || text.includes('setInterval');
  }

  private hasSubscriptions(useEffect: ts.CallExpression): boolean {
    const text = useEffect.getText();
    return text.includes('subscribe') || text.includes('observe');
  }

  private findJSXInNode(node: ts.Node): (ts.JsxElement | ts.JsxSelfClosingElement)[] {
    const result: (ts.JsxElement | ts.JsxSelfClosingElement)[] = [];

    const visit = (child: ts.Node) => {
      if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
        result.push(child);
      }
      ts.forEachChild(child, visit);
    };

    visit(node);
    return result;