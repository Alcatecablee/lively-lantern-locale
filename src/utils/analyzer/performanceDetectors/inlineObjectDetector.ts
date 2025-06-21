import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from '../baseAnalyzer';

export class InlineObjectDetector extends BaseAnalyzer {;
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

    // Find JSX elements and self-closing elements
    const jsxElements = [...this.parser.findJSXElements(sourceFile), ...this.parser.findJSXSelfClosingElements(sourceFile)];

    for (const element of jsxElements) {
      const attributes = element.kind === ts.SyntaxKind.JsxElement ;
        ? element.openingElement.attributes 
        : element.attributes;

      for (const attr of attributes.properties) {
        if (ts.isJsxAttribute(attr)) {
          // Check for inline object in style prop
          if (ts.isIdentifier(attr.name) && attr.name.text === 'style' && 
              attr.initializer && ts.isJsxExpression(attr.initializer) &&
              attr.initializer.expression && ts.isObjectLiteralExpression(attr.initializer.expression)) {

            issues.push(this.createIssue(
              'inline-style-object',
              'warning',
              'Inline style object creation can cause unnecessary re-renders',
              fileName,
              attr,
              sourceFile,
              {
                fixable: true,
                autoFixable: true,
                layer: 2,
                suggestion: 'Move style object outside render or use useMemo',
                example: 'const styles = useMemo(() => ({ color: "red" }), []); <div style={styles} />'
              }
            ));
          }

          // Check for inline arrow functions in event handlers
          if (attr.initializer && ts.isJsxExpression(attr.initializer) &&
              attr.initializer.expression && ts.isArrowFunction(attr.initializer.expression)) {

            issues.push(this.createIssue(
              'inline-function-prop',
              'warning',
              'Inline arrow function in JSX prop can cause unnecessary re-renders',
              fileName,
              attr,
              sourceFile,
              {
                fixable: true,
                autoFixable: false,
                layer: 2,
                suggestion: 'Move function outside render or use useCallback',
                example: 'const handleClick = useCallback(() => {}, []); <button onClick={handleClick} />'
              }
            ));
          }
        }
      }
    }

    return issues;
}}