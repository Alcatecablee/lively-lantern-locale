import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from './baseAnalyzer';

export class AccessibilityAnalyzer extends BaseAnalyzer {;
  analyze(fileName: string, content: string): CodeIssue[] {;
    const issues: CodeIssue[] = [];

    try {
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Check for missing alt text
      issues.push(...this.findMissingAltText(sourceFile, fileName));

      // Check for missing ARIA labels
      issues.push(...this.findMissingAriaLabels(sourceFile, fileName));

      // Check for keyboard accessibility
      issues.push(...this.findKeyboardAccessibilityIssues(sourceFile, fileName));

      // Check for color contrast issues
      issues.push(...this.findColorContrastIssues(sourceFile, fileName));

      // Check for semantic HTML usage
      issues.push(...this.findSemanticHTMLIssues(sourceFile, fileName));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
  }

  private findMissingAltText(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const imgElements = [
      ...this.parser.findJSXElements(sourceFile),
      ...this.parser.findJSXSelfClosingElements(sourceFile)
    ].filter(element => {
      const tagName = element.kind === ts.SyntaxKind.JsxElement ;
        ? element.openingElement.tagName 
        : element.tagName;
      return ts.isIdentifier(tagName) && tagName.text === 'img';
    });

    for (const imgElement of imgElements) {
      if (!this.hasJSXAttribute(imgElement, 'alt')) {
        issues.push(this.createIssue(
          'missing-alt-text',
          'warning',
          'Image element missing alt attribute for accessibility',
          fileName,
          imgElement,
          sourceFile,
          {
            fixable: true,
            autoFixable: true,
            layer: 5,
            suggestion: 'Add descriptive alt text to all images',
            example: '<img src="..." alt="Description of the image" />'
          }
        ));
      }
    }

    return issues;
  }

  private findMissingAriaLabels(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const interactiveElements = [
      ...this.parser.findJSXElements(sourceFile),
      ...this.parser.findJSXSelfClosingElements(sourceFile)
    ].filter(element => {
      // Check for interactive elements without proper ARIA
      return this.hasJSXAttribute(element, 'onClick') && 
             !this.hasSemanticRole(element) &&
             !this.hasJSXAttribute(element, 'role') &&
             !this.hasJSXAttribute(element, 'aria-label');
    });

    for (const element of interactiveElements) {
      const tagName = this.getElementTagName(element);
      issues.push(this.createIssue(
        'missing-aria-role',
        'warning',
        `Interactive ${tagName} element missing ARIA role or label`,
        fileName,
        element,
        sourceFile,
        {
          fixable: true,
          autoFixable: true,
          layer: 5,
          suggestion: 'Add appropriate ARIA roles and labels to interactive elements',
          example: '<div role="button" aria-label="Close dialog" onClick={...} onKeyDown={...} tabIndex={0}>'
        }
      ));
    }

    return issues;
  }

  private findKeyboardAccessibilityIssues(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const clickableElements = [
      ...this.parser.findJSXElements(sourceFile),
      ...this.parser.findJSXSelfClosingElements(sourceFile)
    ].filter(element => {
      return this.hasJSXAttribute(element, 'onClick') && 
             !this.hasSemanticInteractiveRole(element);
    });

    for (const element of clickableElements) {
      const hasKeyboardHandler = this.hasJSXAttribute(element, 'onKeyDown') || ;
                                 this.hasJSXAttribute(element, 'onKeyPress');
      const hasTabIndex = this.hasJSXAttribute(element, 'tabIndex');

      if (!hasKeyboardHandler || !hasTabIndex) {
        const tagName = this.getElementTagName(element);
        issues.push(this.createIssue(
          'keyboard-accessibility',
          'warning',
          `Clickable ${tagName} element may not be keyboard accessible`,
          fileName,
          element,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 5,
            suggestion: 'Add keyboard event handlers and tabIndex for keyboard accessibility',
            example: '<div onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0}>'
          }
        ));
      }
    }

    return issues;
  }

  private findColorContrastIssues(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Check for potential color contrast issues in inline styles
    const elementsWithStyle = [
      ...this.parser.findJSXElements(sourceFile),
      ...this.parser.findJSXSelfClosingElements(sourceFile)
    ].filter(element => this.hasJSXAttribute(element, 'style'));

    for (const element of elementsWithStyle) {
      const styleValue = this.getJSXAttributeValue(element, 'style');
      if (styleValue && (styleValue.includes('color') || styleValue.includes('background'))) {
        issues.push(this.createIssue(
          'potential-contrast-issue',
          'info',
          'Element with color styles should be checked for sufficient contrast ratio',
          fileName,
          element,
          sourceFile,
          {
            fixable: false,
            autoFixable: false,
            layer: 5,
            suggestion: 'Ensure color combinations meet WCAG contrast requirements (4.5:1 for normal text)',
            example: 'Use tools like WebAIM Color Contrast Checker to verify accessibility'
          }
        ));
      }
    }

    return issues;
  }

  private findSemanticHTMLIssues(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Check for div/span elements that should use semantic HTML
    const genericElements = [
      ...this.parser.findJSXElements(sourceFile),
      ...this.parser.findJSXSelfClosingElements(sourceFile)
    ].filter(element => {
      const tagName = this.getElementTagName(element);
      return ['div', 'span'].includes(tagName) && this.hasJSXAttribute(element, 'onClick');
    });

    for (const element of genericElements) {
      const tagName = this.getElementTagName(element);
      issues.push(this.createIssue(
        'semantic-html',
        'info',
        `Consider using semantic HTML instead of clickable ${tagName} element`,
        fileName,
        element,
        sourceFile,
        {
          fixable: true,
          autoFixable: false,
          layer: 5,
          suggestion: 'Use semantic HTML elements like <button> for better accessibility',
          example: 'Replace <div onClick={...}> with <button onClick={...}> for better semantics'
        }
      ));
    }

    return issues;
  }

  private hasSemanticRole(element: ts.JsxElement | ts.JsxSelfClosingElement): boolean {
    const tagName = this.getElementTagName(element);
    return ['button', 'a', 'input', 'select', 'textarea'].includes(tagName);
  }

  private hasSemanticInteractiveRole(element: ts.JsxElement | ts.JsxSelfClosingElement): boolean {
    const tagName = this.getElementTagName(element);
    return ['button', 'a', 'input', 'select', 'textarea', 'summary'].includes(tagName);
  }

  private getElementTagName(element: ts.JsxElement | ts.JsxSelfClosingElement): string {
    const tagName = element.kind === ts.SyntaxKind.JsxElement ;
      ? element.openingElement.tagName 
      : element.tagName;
    return ts.isIdentifier(tagName) ? tagName.text : '';
}}