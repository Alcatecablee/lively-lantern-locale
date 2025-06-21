import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from './baseAnalyzer';

export class ComplexityAnalyzer extends BaseAnalyzer {;
  analyze(fileName: string, content: string): CodeIssue[] {;
    const issues: CodeIssue[] = [];

    try {
      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Check for cyclomatic complexity
      issues.push(...this.findHighComplexityFunctions(sourceFile, fileName));

      // Check for code duplication
      issues.push(...this.findDuplicateCode(sourceFile, fileName));

      // Check for deep nesting
      issues.push(...this.findDeepNesting(sourceFile, fileName));

      // Check for long parameter lists
      issues.push(...this.findLongParameterLists(sourceFile, fileName));

      // Check for large files
      issues.push(...this.findLargeFiles(sourceFile, fileName, content));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
    }

    return issues;
  }

  private findHighComplexityFunctions(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const functions = [
      ...this.parser.findFunctionDeclarations(sourceFile),
      ...this.parser.findNodes(sourceFile, ts.isArrowFunction) as ts.ArrowFunction[],
      ...this.parser.findNodes(sourceFile, ts.isFunctionExpression) as ts.FunctionExpression[],
      ...this.parser.findNodes(sourceFile, ts.isMethodDeclaration) as ts.MethodDeclaration[]
    ];

    for (const func of functions) {
      const complexity = this.calculateCyclomaticComplexity(func);
      const functionName = this.getFunctionName(func) || 'Anonymous function';

      if (complexity > 15) {
        issues.push(this.createIssue(
          'high-complexity',
          'error',
          `Function '${functionName}' has very high cyclomatic complexity (${complexity})`,
          fileName,
          func,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 4,
            suggestion: 'Break down into smaller functions, reduce conditional nesting',
            example: 'Extract complex logic into separate helper functions'
          }
        ));
      } else if (complexity > 10) {
        issues.push(this.createIssue(
          'moderate-complexity',
          'warning',
          `Function '${functionName}' has high cyclomatic complexity (${complexity})`,
          fileName,
          func,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 4,
            suggestion: 'Consider breaking down into smaller functions',
            example: 'Use early returns to reduce nesting'
          }
        ));
      }
    }

    return issues;
  }

  private findDuplicateCode(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const functions = [
      ...this.parser.findFunctionDeclarations(sourceFile),
      ...this.parser.findNodes(sourceFile, ts.isArrowFunction) as ts.ArrowFunction[],
      ...this.parser.findNodes(sourceFile, ts.isFunctionExpression) as ts.FunctionExpression[]
    ];

    const functionSignatures = new Map<string, ts.Node[]>();

    for (const func of functions) {
      const signature = this.getFunctionSignature(func);
      if (signature.length > 100) { // Only check substantial functions
        if (!functionSignatures.has(signature)) {
          functionSignatures.set(signature, []);
        }
        functionSignatures.get(signature)!.push(func);
      }
    }

    // Check for similar code blocks
    for (const [signature, duplicates] of functionSignatures) {
      if (duplicates.length > 1) {
        for (const duplicate of duplicates) {
          const functionName = this.getFunctionName(duplicate) || 'Anonymous function';
          issues.push(this.createIssue(
            'duplicate-code',
            'warning',
            `Function '${functionName}' appears to be duplicated`,
            fileName,
            duplicate,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 4,
              suggestion: 'Extract common logic into shared utility functions',
              example: 'Create a shared function and import it where needed'
            }
          ));
        }
      }
    }

    return issues;
  }

  private findDeepNesting(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const functions = [
      ...this.parser.findFunctionDeclarations(sourceFile),
      ...this.parser.findNodes(sourceFile, ts.isArrowFunction) as ts.ArrowFunction[],
      ...this.parser.findNodes(sourceFile, ts.isFunctionExpression) as ts.FunctionExpression[]
    ];

    for (const func of functions) {
      const maxDepth = this.calculateNestingDepth(func);

      if (maxDepth > 4) {
        const functionName = this.getFunctionName(func) || 'Anonymous function';
        issues.push(this.createIssue(
          'deep-nesting',
          'warning',
          `Function '${functionName}' has deep nesting (${maxDepth} levels)`,
          fileName,
          func,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 4,
            suggestion: 'Reduce nesting using early returns and guard clauses',
            example: 'if (!condition) return; // early return instead of else block'
          }
        ));
      }
    }

    return issues;
  }

  private findLongParameterLists(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const functions = [
      ...this.parser.findFunctionDeclarations(sourceFile),
      ...this.parser.findNodes(sourceFile, ts.isArrowFunction) as ts.ArrowFunction[],
      ...this.parser.findNodes(sourceFile, ts.isFunctionExpression) as ts.FunctionExpression[]
    ];

    for (const func of functions) {
      const paramCount = this.getParameterCount(func);

      if (paramCount > 5) {
        const functionName = this.getFunctionName(func) || 'Anonymous function';
        issues.push(this.createIssue(
          'long-parameter-list',
          'warning',
          `Function '${functionName}' has too many parameters (${paramCount})`,
          fileName,
          func,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 4,
            suggestion: 'Group related parameters into objects or use configuration objects',
            example: 'function process(config: ProcessConfig) instead of multiple parameters'
          }
        ));
      }
    }

    return issues;
  }

  private findLargeFiles(sourceFile: ts.SourceFile, fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const lineCount = content.split('\n').length;
    const characterCount = content.length;

    if (lineCount > 500) {
      const mockNode = sourceFile.getChildren()[0] || sourceFile;
      issues.push(this.createIssue(
        'large-file',
        'warning',
        `File is very large (${lineCount} lines) - consider splitting into smaller modules`,
        fileName,
        mockNode,
        sourceFile,
        {
          fixable: true,
          autoFixable: false,
          layer: 4,
          suggestion: 'Split file into smaller, focused modules',
          example: 'Extract components, utilities, and types into separate files'
        }
      ));
    }

    if (characterCount > 10000) {
      const mockNode = sourceFile.getChildren()[0] || sourceFile;
      issues.push(this.createIssue(
        'large-file-size',
        'info',
        `File is large (${Math.round(characterCount / 1000)}KB) - consider modularization`,
        fileName,
        mockNode,
        sourceFile,
        {
          fixable: true,
          autoFixable: false,
          layer: 4,
          suggestion: 'Break down into smaller, more maintainable files',
          example: 'Separate concerns into different modules'
        }
      ));
    }

    return issues;
  }

  private calculateCyclomaticComplexity(node: ts.Node): number {
    let complexity = 1; // Base complexity;

    const visit = (child: ts.Node) => {
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
        case ts.SyntaxKind.BinaryExpression:
          const binExpr = child as ts.BinaryExpression;
          if (binExpr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
              binExpr.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
            complexity++;
          }
          break;
      }
      ts.forEachChild(child, visit);
    };

    visit(node);
    return complexity;
  }

  private calculateNestingDepth(node: ts.Node): number {
    let maxDepth = 0;

    const visit = (child: ts.Node, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);

      switch (child.kind) {
        case ts.SyntaxKind.IfStatement:
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
        case ts.SyntaxKind.SwitchStatement:
        case ts.SyntaxKind.TryStatement:
          ts.forEachChild(child, (grandChild) => visit(grandChild, depth + 1));
          break;
        default:
          ts.forEachChild(child, (grandChild) => visit(grandChild, depth));
          break;
      }
    };

    visit(node, 0);
    return maxDepth;
  }

  private getFunctionSignature(func: ts.Node): string {
    // Get normalized function body for comparison
    const body = this.getFunctionBody(func);
    if (!body) return '';

    // Normalize whitespace and remove comments for comparison
    return body.getText()
      .replace(/\s+/g, ' ')
      .replace(/\/\*.*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim();
  }

  private getFunctionBody(func: ts.Node): ts.Node | null {
    if (ts.isFunctionDeclaration(func) || ts.isFunctionExpression(func)) {
      return func.body || null;
    }
    if (ts.isArrowFunction(func)) {
      return func.body;
    }
    if (ts.isMethodDeclaration(func)) {
      return func.body || null;
    }
    return null;
  }

  private getFunctionName(func: ts.Node): string | null {
    if (ts.isFunctionDeclaration(func) && func.name) {
      return func.name.text;
    }
    if (ts.isMethodDeclaration(func) && ts.isIdentifier(func.name)) {
      return func.name.text;
    }
    if (ts.isVariableDeclaration(func.parent) && ts.isIdentifier(func.parent.name)) {
      return func.parent.name.text;
    }
    return null;
  }

  private getParameterCount(func: ts.Node): number {
    if (ts.isFunctionDeclaration(func) || ts.isFunctionExpression(func) || ts.isArrowFunction(func)) {
      return func.parameters.length;
    }
    if (ts.isMethodDeclaration(func)) {
      return func.parameters.length;
    }
    return 0;
  }
}

export default process;