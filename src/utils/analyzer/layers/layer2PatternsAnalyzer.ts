import { BaseAnalyzer } from '../baseAnalyzer';
import { CodeIssue } from '@/types/analysis';
import * as ts from 'typescript';
/**
 * Layer 2: Bulk Pattern Fixes
 * - Remove unused imports
 * - Fix type assertions
 * - Fix HTML entity corruption
 * - Standardize quote usage
 * - Fix common React patterns
 */
export class Layer2PatternsAnalyzer extends BaseAnalyzer {
  analyze(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    // Skip configuration files for pattern analysis
    if (fileName.endsWith('.json') || fileName.endsWith('.config.js')) {
      return issues;
    }
    // Check for HTML entity corruption
    issues.push(...this.checkHtmlEntityCorruption(fileName, content));
    // Check for problematic patterns
    issues.push(...this.checkProblematicPatterns(fileName, content));
    // Check for import issues
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx') || fileName.endsWith('.js') || fileName.endsWith('.jsx')) {
      issues.push(...this.checkImportIssues(fileName, content));
    }
    // Check React-specific patterns
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
      issues.push(...this.checkReactPatterns(fileName, content));
    }
    return issues;
  }
  private checkHtmlEntityCorruption(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      // Check for HTML entity quotes
      if (line.includes('"')) {
        issues.push({
          id: this.generateId('html-entity-quotes', fileName, lineNum, 1, 'HTML entity quotes'),
          type: 'corruption',
          severity: 'high',
          message: 'HTML entity corruption detected: " should be "',
          line: lineNum,
          column: line.indexOf('"') + 1,
          file: fileName,
          rule: 'html-entity-quotes',
          category: 'corruption'
        });
      }
      // Check for HTML entity apostrophes
      if (line.includes(''')) {
        issues.push({
          id: this.generateId('html-entity-apostrophes', fileName, lineNum, 1, 'HTML entity apostrophes'),
          type: 'corruption',
          severity: 'high',
          message: 'HTML entity corruption detected: ' should be \'',
          line: lineNum,
          column: line.indexOf(''') + 1,
          file: fileName,
          rule: 'html-entity-apostrophes',
          category: 'corruption'
        });
      }
      // Check for HTML entity ampersands
      if (line.includes('&')) {
        issues.push({
          id: this.generateId('html-entity-ampersands', fileName, lineNum, 1, 'HTML entity ampersands'),
          type: 'corruption',
          severity: 'medium',
          message: 'HTML entity corruption detected: & should be &',
          line: lineNum,
          column: line.indexOf('&') + 1,
          file: fileName,
          rule: 'html-entity-ampersands',
          category: 'corruption'
        });
      }
    });
    return issues;
  }
  private checkProblematicPatterns(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      // Check for any type assertions
      if (line.includes('// @ts-ignore
')) {
        issues.push({
          id: this.generateId('any-type-assertion', fileName, lineNum, 1, 'Any type assertion'),
          type: 'typescript',
          severity: 'warning',
          message: 'Using "// @ts-ignore
" bypasses type checking - consider proper typing',
          line: lineNum,
          column: line.indexOf('// @ts-ignore
') + 1,
          file: fileName,
          fixable: true,
          autoFixable: false,
          layer: 2,
          suggestion: 'Replace "// @ts-ignore
" with proper type assertion or @ts-ignore comment',
          example: line.replace(/// @ts-ignore
/g, '// @ts-ignore\n')
        });
      }
      // Check for console.log in production files
      if (line.includes('console.debug(') && !fileName.includes('test') && !fileName.includes('spec')) {
        issues.push({
          id: this.generateId('console-log', fileName, lineNum, 1, 'Console log statement'),
          type: 'debug',
          severity: 'info',
          message: 'Console.log statement found - consider using console.debug for development',
          line: lineNum,
          column: line.indexOf('console.debug(') + 1,
          file: fileName,
          fixable: true,
          autoFixable: true,
          layer: 2,
          suggestion: 'Replace console.log with console.debug or remove for production',
          example: line.replace(/console\.log\(/g, 'console.debug(')
        });
      }
      // Check for React.Fragment verbose syntax
      if (line.includes('<React.Fragment>')) {
        issues.push({
          id: this.generateId('react-fragment-verbose', fileName, lineNum, 1, 'Verbose React Fragment'),
          type: 'react',
          severity: 'info',
          message: 'Use React Fragment shorthand syntax instead of verbose React.Fragment',
          line: lineNum,
          column: line.indexOf('<React.Fragment>') + 1,
          file: fileName,
          fixable: true,
          autoFixable: true,
          layer: 2,
          suggestion: 'Replace <React.Fragment> with <> shorthand',
          example: line.replace(/<React\.Fragment>/g, '<>').replace(/<\/React\.Fragment>/g, '</>')
        });
      }
    });
    return issues;
  }
  private checkImportIssues(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    try {
      const parsed = this.parseFile(fileName, content);
      const sourceFile = parsed.sourceFile;
      // Check for potentially unused imports
      const imports = this.parser.findImportDeclarations(sourceFile);
      const bodyText = sourceFile.getFullText();
      imports.forEach(importDecl => {
        if (importDecl.importClause) {
          // Check default imports
          if (importDecl.importClause.name) {
            const importName = importDecl.importClause.name.text;
            // Simple check - if import name doesn't appear in body (excluding import line)
            const importLine = sourceFile.getLineAndCharacterOfPosition(importDecl.getStart()).line;
            const bodyLines = bodyText.split('\n');
            const nonImportLines = bodyLines.filter((_, idx) => idx !== importLine);
            const restOfFile = nonImportLines.join('\n');
            if (!restOfFile.includes(importName)) {
              const position = this.parser.getLineAndColumn(sourceFile, importDecl.getStart());
              issues.push({
                id: this.generateId('unused-import', fileName, position.line, position.column, `Unused ${importName}`),
                type: 'import',
                severity: 'warning',
                message: `Potentially unused import: ${importName}`,
                line: position.line,
                column: position.column,
                file: fileName,
                fixable: true,
                autoFixable: false, // Requires careful analysis
                layer: 2,
                suggestion: `Remove unused import ${importName} if not needed`
              });
            }
          }
          // Check named imports
          if (importDecl.importClause.namedBindings && ts.isNamedImports(importDecl.importClause.namedBindings)) {
            importDecl.importClause.namedBindings.elements.forEach(element => {
              const importName = element.name.text;
              const importLine = sourceFile.getLineAndCharacterOfPosition(importDecl.getStart()).line;
              const bodyLines = bodyText.split('\n');
              const nonImportLines = bodyLines.filter((_, idx) => idx !== importLine);
              const restOfFile = nonImportLines.join('\n');
              if (!restOfFile.includes(importName)) {
                const position = this.parser.getLineAndColumn(sourceFile, element.getStart());
                issues.push({
                  id: this.generateId('unused-named-import', fileName, position.line, position.column, `Unused ${importName}`),
                  type: 'import',
                  severity: 'warning',
                  message: `Potentially unused named import: ${importName}`,
                  line: position.line,
                  column: position.column,
                  file: fileName,
                  fixable: true,
                  autoFixable: false,
                  layer: 2,
                  suggestion: `Remove unused named import ${importName} if not needed`
                });
              }
            });
          }
        }
      });
      // Check for missing imports for commonly used but unimported items
      this.checkMissingImports(sourceFile, fileName, issues);
    } catch (error) {
      // Skip files that can't be parsed
    }
    return issues;
  }
  private checkReactPatterns(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    try {
      const parsed = this.parseFile(fileName, content);
      const sourceFile = parsed.sourceFile;
      // Check for missing key props in map functions
      this.checkMissingKeyProps(sourceFile, fileName, issues);
      // Check for React import patterns
      this.checkReactImportPatterns(sourceFile, fileName, issues);
    } catch (error) {
      // Skip files that can't be parsed
    }
    return issues;
  }
  private checkMissingKeyProps(sourceFile: ts.SourceFile, fileName: string, issues: CodeIssue[]): void {
    const mapCalls = this.findMapCallsInJSX(sourceFile);
    mapCalls.forEach(mapCall => {
      // Check if the JSX element has a key prop
      if (!this.hasKeyProp(mapCall)) {
        const position = this.parser.getLineAndColumn(sourceFile, mapCall.getStart());
        issues.push({
          id: this.generateId('missing-key-prop', fileName, position.line, position.column, 'Missing key prop'),
          type: 'react',
          severity: 'error',
          message: 'Missing key prop in JSX element within map function',
          line: position.line,
          column: position.column,
          file: fileName,
          fixable: true,
          autoFixable: false, // Complex to auto-fix correctly
          layer: 2,
          suggestion: 'Add unique key prop to JSX element in map function',
          example: '<div key={item.id}> or <div key={index}>'
        });
      }
    });
  }
  private findMapCallsInJSX(sourceFile: ts.SourceFile): ts.Node[] {
    const mapCalls: ts.Node[] = [];
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) && 
          ts.isPropertyAccessExpression(node.expression) && 
          node.expression.name.text === 'map') {
        // Check if this map call is inside JSX
        let parent = node.parent;
        while (parent) {
          if (ts.isJsxExpression(parent)) {
            mapCalls.push(node);
            break;
          }
          parent = parent.parent;
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return mapCalls;
  }
  private hasKeyProp(node: ts.Node): boolean {
    // This is a simplified check - in practice, would need more sophisticated AST analysis
    const nodeText = node.getFullText();
    return nodeText.includes('key=');
  }
  private checkReactImportPatterns(sourceFile: ts.SourceFile, fileName: string, issues: CodeIssue[]): void {
    const imports = this.parser.findImportDeclarations(sourceFile);
    imports.forEach(importDecl => {
      if (ts.isStringLiteral(importDecl.moduleSpecifier) && 
          importDecl.moduleSpecifier.text === 'react') {
        const importText = importDecl.getFullText();
        // Check for verbose React import with destructuring
        if (importText.includes('import React, {') && importText.includes('import React, { ')) {
          const position = this.parser.getLineAndColumn(sourceFile, importDecl.getStart());
          issues.push({
            id: this.generateId('react-import-pattern', fileName, position.line, position.column, 'Verbose React import'),
            type: 'import',
            severity: 'info',
            message: 'Consider simplifying React import - React default import may not be needed with new JSX transform',
            line: position.line,
            column: position.column,
            file: fileName,
            fixable: true,
            autoFixable: false,
            layer: 2,
            suggestion: 'Use named imports only if React default import is not used',
            example: 'import { useState, useEffect } from "react";'
          });
        }
      }
    });
  }
  private checkMissingImports(sourceFile: ts.SourceFile, fileName: string, issues: CodeIssue[]): void {
    const content = sourceFile.getFullText();
    // Common patterns that need imports
    const patterns = [
      { pattern: /useState\b/, import: 'useState', from: 'react' },
      { pattern: /useEffect\b/, import: 'useEffect', from: 'react' },
      { pattern: /useCallback\b/, import: 'useCallback', from: 'react' },
      { pattern: /useMemo\b/, import: 'useMemo', from: 'react' },
      { pattern: /useContext\b/, import: 'useContext', from: 'react' },
      { pattern: /useRef\b/, import: 'useRef', from: 'react' }
    ];
    patterns.forEach(({ pattern, import: importName, from }) => {
      if (pattern.test(content) && !content.includes(`import.*${importName}`)) {
        issues.push({
          id: this.generateId('missing-hook-import', fileName, 1, 1, `Missing ${importName} import`),
          type: 'import',
          severity: 'error',
          message: `${importName} is used but not imported from ${from}`,
          line: 1,
          column: 1,
          file: fileName,
          fixable: true,
          autoFixable: true,
          layer: 2,
          suggestion: `Import ${importName} from ${from}`,
          example: `import { ${importName} } from '${from}';`
        });
      }
    });
  }
}