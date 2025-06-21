import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from './baseAnalyzer';

export class CodeQualityAnalyzer extends BaseAnalyzer {;
  analyze(fileName: string, content: string): CodeIssue[] {;
    const issues: CodeIssue[] = [];

    try {
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Check for console statements
      issues.push(...this.findConsoleStatements(sourceFile, fileName));

      // Check for magic numbers
      issues.push(...this.findMagicNumbers(sourceFile, fileName));

      // Check for complex functions
      issues.push(...this.findComplexFunctions(sourceFile, fileName));

      // Check for duplicate code
      issues.push(...this.findDuplicateCode(sourceFile, fileName));

      // Check for TODO/FIXME comments
      issues.push(...this.findTodoComments(sourceFile, fileName, content));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
  }

  private findConsoleStatements(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const consoleCalls = this.parser.findCallExpressions(sourceFile).filter(call => {;
      if (ts.isPropertyAccessExpression(call.expression)) {
        return ts.isIdentifier(call.expression.expression) && 
               call.expression.expression.text === 'console';
      }
      return false;
    });

    for (const consoleCall of consoleCalls) {
      issues.push(this.createIssue(
        'console-statements',
        'info',
        'Console statements found in production code',
        fileName,
        consoleCall,
        sourceFile,
        {
          fixable: true,
          autoFixable: true,
          layer: 4,
          suggestion: 'Remove console statements or use proper logging library',
          example: 'Use a logging library like winston or remove debug statements'
        }
      ));
    }

    return issues;
  }

  private findMagicNumbers(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const numericLiterals = this.parser.findNodes(sourceFile, ts.isNumericLiteral) as ts.NumericLiteral[];

    for (const literal of numericLiterals) {
      const value = parseFloat(literal.text);
      // Flag numbers that are not 0, 1, -1, or small integers
      if (!Number.isInteger(value) || (Math.abs(value) > 1 && Math.abs(value) < 100)) {
        // Skip common non-magic numbers
        if (![0, 1, -1, 10, 100, 1000].includes(value)) {
          issues.push(this.createIssue(
            'magic-numbers',
            'info',
            `Magic number '${value}' found in code`,
            fileName,
            literal,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 4,
              suggestion: 'Replace magic numbers with named constants',
              example: `const MAX_ITEMS = ${value}; // instead of using ${value} directly`
            }
          ));
        }
      }
    }

    return issues;
  }

  private findComplexFunctions(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const functions = [
      ...this.parser.findFunctionDeclarations(sourceFile),
      ...this.parser.findNodes(sourceFile, ts.isArrowFunction) as ts.ArrowFunction[],
      ...this.parser.findNodes(sourceFile, ts.isFunctionExpression) as ts.FunctionExpression[]
    ];

    for (const func of functions) {
      const complexity = this.calculateCyclomaticComplexity(func);
      if (complexity > 10) {
        const functionName = this.getFunctionName(func) || 'Anonymous function';
        issues.push(this.createIssue(
          'complex-function',
          'warning',
          `Function '${functionName}' has high cyclomatic complexity (${complexity})`,
          fileName,
          func,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 4,
            suggestion: 'Break down complex functions into smaller, focused functions',
            example: 'Extract logic into helper functions or use early returns to reduce nesting'
          }
        ));
      }
    }

    return issues;
  }

  private findDuplicateCode(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Simple duplicate detection for similar function bodies
    const functions = [
      ...this.parser.findFunctionDeclarations(sourceFile),
      ...this.parser.findNodes(sourceFile, ts.isArrowFunction) as ts.ArrowFunction[],
      ...this.parser.findNodes(sourceFile, ts.isFunctionExpression) as ts.FunctionExpression[]
    ];

    const functionBodies = new Map<string, ts.Node[]>();

    for (const func of functions) {
      const body = func.kind === ts.SyntaxKind.ArrowFunction ;
        ? (func as ts.ArrowFunction).body 
        : func.body;

      if (body) {
        const bodyText = body.getText().trim();
        if (bodyText.length > 50) { // Only check substantial bodies
          if (!functionBodies.has(bodyText)) {
            functionBodies.set(bodyText, []);
          }
          functionBodies.get(bodyText)!.push(func);
        }
      }
    }

    for (const [bodyText, duplicates] of functionBodies) {
      if (duplicates.length > 1) {
        for (const duplicate of duplicates) {
          const functionName = this.getFunctionName(duplicate) || 'Anonymous function';
          issues.push(this.createIssue(
            'duplicate-code',
            'info',
            `Function '${functionName}' appears to have duplicate implementation`,
            fileName,
            duplicate,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 4,
              suggestion: 'Extract common logic into shared utility functions',
              example: 'Create a shared function and call it from both locations'
            }
          ));
        }
      }
    }

    return issues;
  }

  private findTodoComments(sourceFile: ts.SourceFile, fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Find TODO/FIXME comments in the source
    const lines = content.split('\n');
    const todoPattern = /\b(TODO|FIXME|HACK|XXX|NOTE)\b/i;

    lines.forEach((line, index) => {
      if (todoPattern.test(line) && line.includes('//')) {
        // Create a simple position-based node reference using the first token
        const mockNode = sourceFile.getChildren()[0] || sourceFile;
        issues.push(this.createIssue(
          'todo-comments',
          'info',
          `TODO/FIXME comment found: ${line.trim()}`,
          fileName,
          mockNode,
          sourceFile,
          {
            fixable: false,
            autoFixable: false,
            layer: 4,
            suggestion: 'Address TODO/FIXME comments or create proper tickets',
            example: 'Convert comments to proper issue tracking or implement the feature'
          }
        ));
      }
    });

    return issues;
  }

  private calculateCyclomaticComplexity(node: ts.Node): number {
    let complexity = 1; // Base complexity;

    this.parser.visitNode(node, (child) => {
      switch (child.kind) {
        case ts.SyntaxKind.IfStatement:
        case ts.SyntaxKind.ConditionalExpression:
        case ts.SyntaxKind.SwitchStatement:
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
        case ts.SyntaxKind.CatchClause:
          complexity++;
          break;
        case ts.SyntaxKind.CaseClause:
          complexity++;
          break;
      }
    });

    return complexity;
  }

  private getFunctionName(node: ts.Node): string | null {
    if (ts.isFunctionDeclaration(node) && node.name) {
      return node.name.text;
    }
    if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
      return node.parent.name.text;
    }
    return null;
}
}