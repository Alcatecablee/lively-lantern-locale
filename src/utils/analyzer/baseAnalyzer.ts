import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { ASTParser, ParsedFile } from './astParser';

export abstract class BaseAnalyzer {
  protected parser: ASTParser;

  constructor() {
    this.parser = new ASTParser();
  }

  abstract analyze(fileName: string, content: string): CodeIssue[];

  protected createIssue(
    type: string,
    severity: 'error' | 'warning' | 'info',
    message: string,
    file: string,
    node: ts.Node,
    sourceFile: ts.SourceFile,
    options: {
      fixable?: boolean;
      autoFixable?: boolean;
      layer: number;
      suggestion?: string;
      example?: string;
    }
  ): CodeIssue {
    const position = this.parser.getLineAndColumn(sourceFile, node.getStart());

    return {
      id: this.generateId(type, file, position.line, position.column, message),
      type,
      severity,
      message,
      line: position.line,
      column: position.column,
      file,
      fixable: options.fixable || false,
      autoFixable: options.autoFixable || false,
      layer: options.layer,
      suggestion: options.suggestion,
      example: options.example
    };
  }

  protected generateId(type: string, file: string, line: number, column: number, message: string): string {
    // Create a consistent ID based on issue content
    const content = `${type}-${file}-${line}-${column}-${message}`;
    // Simple hash function to create a shorter, consistent ID
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  protected parseFile(fileName: string, content: string): ParsedFile {
    return this.parser.parseFile(fileName, content);
  }

  protected isConditionalBlock(node: ts.Node): boolean {
    let current = node.parent;
    while (current) {
      if (ts.isIfStatement(current) || 
          ts.isConditionalExpression(current) || 
          ts.isForStatement(current) ||
          ts.isWhileStatement(current) ||
          ts.isDoStatement(current)) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  protected getJSXAttributeValue(element: ts.JsxElement | ts.JsxSelfClosingElement, attributeName: string): string | null {
    const attributes = element.kind === ts.SyntaxKind.JsxElement 
      ? element.openingElement.attributes 
      : element.attributes;

    for (const attr of attributes.properties) {
      if (ts.isJsxAttribute(attr) && 
          ts.isIdentifier(attr.name) && 
          attr.name.text === attributeName) {
        if (attr.initializer && ts.isStringLiteral(attr.initializer)) {
          return attr.initializer.text;
        }
      }
    }
    return null;
  }

  protected hasJSXAttribute(element: ts.JsxElement | ts.JsxSelfClosingElement, attributeName: string): boolean {
    const attributes = element.kind === ts.SyntaxKind.JsxElement 
      ? element.openingElement.attributes 
      : element.attributes;

    for (const attr of attributes.properties) {
      if (ts.isJsxAttribute(attr) && 
          ts.isIdentifier(attr.name) && 
          attr.name.text === attributeName) {
        return true;
      }
    }
    return false;
  }

  protected getComponentName(node: ts.Node): string | null {
    if (ts.isFunctionDeclaration(node) && node.name) {
      return node.name.text;
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      return node.name.text;
    }
    return null;
  }

  protected isReactImported(sourceFile: ts.SourceFile): boolean {
    const imports = this.parser.findImportDeclarations(sourceFile);
    return imports.some(imp => {
      if (ts.isStringLiteral(imp.moduleSpecifier)) {
        return imp.moduleSpecifier.text === 'react';
      }
      return false;
    });
  }

  protected findReactHooks(sourceFile: ts.SourceFile): ts.CallExpression[] {
    const calls = this.parser.findCallExpressions(sourceFile);
    return calls.filter(call => this.parser.isHookCall(call));
  }
}