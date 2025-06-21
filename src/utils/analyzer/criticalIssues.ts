import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from './baseAnalyzer';

export class CriticalIssuesAnalyzer extends BaseAnalyzer {;
  analyze(fileName: string, content: string): CodeIssue[] {;
    const issues: CodeIssue[] = [];

    try {
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Check for missing keys in list rendering
      issues.push(...this.findMissingKeys(sourceFile, fileName));

      // Check for conditional hooks
      issues.push(...this.findConditionalHooks(sourceFile, fileName));

      // Check for invalid hook usage
      issues.push(...this.findInvalidHookUsage(sourceFile, fileName));

      // Check for missing dependencies in useEffect
      issues.push(...this.findMissingEffectDependencies(sourceFile, fileName));

      // Check for direct state mutation
      issues.push(...this.findDirectStateMutation(sourceFile, fileName));

      // Check for syntax errors
      issues.push(...this.findSyntaxErrors(sourceFile, fileName));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
  }

  private findMissingKeys(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Find .map() calls
    const mapCalls = this.parser.findCallExpressions(sourceFile).filter(call => {;
      if (ts.isPropertyAccessExpression(call.expression)) {
        return ts.isIdentifier(call.expression.name) && call.expression.name.text === 'map';
      }
      return false;
    });

    for (const mapCall of mapCalls) {
      // Check if the callback returns JSX
      if (mapCall.arguments.length > 0) {
        const callback = mapCall.arguments[0];
        if ((ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) && 
            this.parser.containsJSX(callback)) {

          // Check if JSX elements have key prop - use findNodes on the callback directly
          const jsxElements = [
            ...this.findJSXInNode(callback, ts.isJsxElement) as ts.JsxElement[],
            ...this.findJSXInNode(callback, ts.isJsxSelfClosingElement) as ts.JsxSelfClosingElement[]
          ];

          for (const element of jsxElements) {
            if (!this.hasJSXAttribute(element, 'key')) {
              issues.push(this.createIssue(
                'missing-key-prop',
                'error',
                'Missing key prop in list rendering - this can cause React rendering issues',
                fileName,
                element,
                sourceFile,
                {
                  fixable: true,
                  autoFixable: true,
                  layer: 1,
                  suggestion: 'Add a unique key prop to each item in the list',
                  example: 'items.map(item => <Item key={item.id} {...item} />)'
                }
              ));
            }
          }
        }
      }
    }

    return issues;
  }

  private findJSXInNode(node: ts.Node, predicate: (node: ts.Node) => boolean): ts.Node[] {
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

  private findConditionalHooks(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const hooks = this.findReactHooks(sourceFile);

    for (const hook of hooks) {
      if (this.isConditionalBlock(hook)) {
        issues.push(this.createIssue(
          'conditional-hooks',
          'error',
          'React hooks cannot be called conditionally - this violates the Rules of Hooks',
          fileName,
          hook,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 1,
            suggestion: 'Move hooks to the top level of the component, outside of conditions and loops',
            example: 'Always call hooks at the top level, never inside loops, conditions, or nested functions'
          }
        ));
      }
    }

    return issues;
  }

  private findInvalidHookUsage(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const hooks = this.findReactHooks(sourceFile);

    for (const hook of hooks) {
      // Check if hook is called outside of React component or custom hook
      if (!this.isInValidHookContext(hook)) {
        issues.push(this.createIssue(
          'invalid-hook-usage',
          'error',
          'React hooks can only be called from React components or custom hooks',
          fileName,
          hook,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 1,
            suggestion: 'Move hook calls inside React components or custom hooks',
            example: 'function Component() { const [state, setState] = useState(); ... }'
          }
        ));
      }
    }

    return issues;
  }

  private findMissingEffectDependencies(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const calls = this.parser.findCallExpressions(sourceFile);

    const useEffectCalls = calls.filter(call => {;
      if (ts.isIdentifier(call.expression)) {
        return call.expression.text === 'useEffect';
      }
      return false;
    });

    for (const useEffectCall of useEffectCalls) {
      if (useEffectCall.arguments.length < 2) {
        issues.push(this.createIssue(
          'missing-effect-dependencies',
          'error',
          'useEffect is missing dependency array - this can cause infinite re-renders',
          fileName,
          useEffectCall,
          sourceFile,
          {
            fixable: true,
            autoFixable: true,
            layer: 1,
            suggestion: 'Add dependency array as second argument to useEffect',
            example: 'useEffect(() => { /* effect */ }, [dependency1, dependency2]);'
          }
        ));
      }
    }

    return issues;
  }

  private findDirectStateMutation(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Find direct assignments that might be state mutations
    const assignments = this.parser.findNodes(sourceFile, ts.isBinaryExpression).filter((node: ts.BinaryExpression) => {
      return node.operatorToken.kind === ts.SyntaxKind.EqualsToken;
    });

    // For now, we'll flag direct property assignments on objects that might be state
    for (const assignment of assignments) {
      const left = (assignment as ts.BinaryExpression).left;
      if (ts.isPropertyAccessExpression(left)) {
        issues.push(this.createIssue(
          'potential-state-mutation',
          'error',
          'Potential direct state mutation detected - use setState instead',
          fileName,
          assignment as ts.Node,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 1,
            suggestion: 'Use the setter function from useState or update state immutably',
            example: 'setState(prevState => ({ ...prevState, newValue }));'
          }
        ));
      }
    }

    return issues;
  }

  private findSyntaxErrors(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Check for basic syntax issues like unclosed tags
    const jsxElements = this.parser.findJSXElements(sourceFile);

    for (const element of jsxElements) {
      // Check for mismatched opening/closing tags
      if (element.openingElement && element.closingElement) {
        const openingTag = element.openingElement.tagName.getText();
        const closingTag = element.closingElement.tagName.getText();

        if (openingTag !== closingTag) {
          issues.push(this.createIssue(
            'mismatched-jsx-tags',
            'error',
            `Mismatched JSX tags: opening tag '${openingTag}' does not match closing tag '${closingTag}'`,
            fileName,
            element,
            sourceFile,
            {
              fixable: true,
              autoFixable: true,
              layer: 1,
              suggestion: 'Ensure opening and closing tags match',
              example: `<${openingTag}>content</${openingTag}>`
            }
          ));
        }
      }
    }

    return issues;
  }

  private isInValidHookContext(hookCall: ts.CallExpression): boolean {
    let current = hookCall.parent;

    while (current) {
      // Check if we're inside a React component
      if ((ts.isFunctionDeclaration(current) || ts.isArrowFunction(current) || ts.isFunctionExpression(current)) &&
          this.parser.isReactComponent(current)) {
        return true;
      }

      // Check if we're inside a custom hook
      if (ts.isFunctionDeclaration(current) && current.name && 
          current.name.text.startsWith('use') && current.name.text.length > 3) {
        return true;
      }

      current = current.parent;
    }

    return false;
  }
}

export default Component;
                  </Item>