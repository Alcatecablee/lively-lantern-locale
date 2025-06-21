import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from '../baseAnalyzer';

export class ReactPatternsAnalyzer extends BaseAnalyzer {
  analyze(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    try {
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Check for string refs
      issues.push(...this.findStringRefs(sourceFile, fileName));

      // Check for deprecated React patterns
      issues.push(...this.findDeprecatedReactPatterns(sourceFile, fileName));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
  }

  private findStringRefs(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const jsxElements = [
      ...this.parser.findJSXElements(sourceFile),
      ...this.parser.findJSXSelfClosingElements(sourceFile)
    ];

    for (const element of jsxElements) {
      const refValue = this.getJSXAttributeValue(element, 'ref');
      if (refValue && typeof refValue === 'string' && !refValue.includes('{')) {
        issues.push(this.createIssue(
          'string-refs',
          'warning',
          'String refs are deprecated, use useRef hook instead',
          fileName,
          element,
          sourceFile,
          {
            fixable: true,
            autoFixable: true,
            layer: 6,
            suggestion: 'Replace string refs with useRef hook',
            example: 'const myRef = useRef(); <div ref={myRef} />'
          }
        ));
      }
    }

    return issues;
  }

  private findDeprecatedReactPatterns(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Check for React.createClass usage
    const createClassCalls = this.parser.findCallExpressions(sourceFile).filter(call => {
      if (ts.isPropertyAccessExpression(call.expression)) {
        return ts.isIdentifier(call.expression.expression) && 
               call.expression.expression.text === 'React' &&
               ts.isIdentifier(call.expression.name) &&
               call.expression.name.text === 'createClass';
      }
      return false;
    });

    for (const call of createClassCalls) {
      issues.push(this.createIssue(
        'deprecated-create-class',
        'warning',
        'React.createClass is deprecated, use ES6 classes or functional components',
        fileName,
        call,
        sourceFile,
        {
          fixable: true,
          autoFixable: false,
          layer: 6,
          suggestion: 'Convert to functional component with hooks or ES6 class',
          example: 'const Component = () => { ... } or class Component extends React.Component { ... }'
        }
      ));
    }

    // Check for findDOMNode usage
    const findDOMNodeCalls = this.parser.findCallExpressions(sourceFile).filter(call => {
      if (ts.isPropertyAccessExpression(call.expression)) {
        return ts.isIdentifier(call.expression.expression) && 
               call.expression.expression.text === 'ReactDOM' &&
               ts.isIdentifier(call.expression.name) &&
               call.expression.name.text === 'findDOMNode';
      }
      return false;
    });

    for (const call of findDOMNodeCalls) {
      issues.push(this.createIssue(
        'deprecated-find-dom-node',
        'warning',
        'ReactDOM.findDOMNode is deprecated, use refs instead',
        fileName,
        call,
        sourceFile,
        {
          fixable: true,
          autoFixable: true,
          layer: 6,
          suggestion: 'Use useRef hook to get direct access to DOM elements',
          example: 'const ref = useRef(); <div ref={ref} />'
        }
      ));
    }

    return issues;
  }
}