import * as ts from 'typescript';
import { CodeIssue } from '@/types/analysis';
import { BaseAnalyzer } from './baseAnalyzer';
import { InputValidator } from '@/utils/validation';

export class SecurityAnalyzer extends BaseAnalyzer {

  private readonly securityPatterns = {
    secrets: [;
      /api[_-]?key\s*[:=]\s*['"`][a-zA-Z0-9_-]{20,}['"`]/gi,;
      /secret[_-]?key\s*[:=]\s*['"`][a-zA-Z0-9_-]{20,}['"`]/gi,;
      /password\s*[:=]\s*['"`][^'"`\s]{8,}['"`]/gi,;
      /token\s*[:=]\s*['"`][a-zA-Z0-9._-]{20,}['"`]/gi,;
      /mongodb:\/\/[^'"`\s]+/gi,;
      /postgres:\/\/[^'"`\s]+/gi,;
    ],;
    xssVulnerabilities: [;
      /dangerouslySetInnerHTML/gi,;
      /innerHTML\s*=\s*[^;]+/gi,
      /document\.write/gi,
    ],
    sqlInjection: [
      /execute\s*\(\s*['"`][^'"`]*\$\{[^}]+\}[^'"`]*['"`]/gi,
      /query\s*\(\s*['"`][^'"`]*\+[^'"`]*['"`]/gi,
    ]
  };

  analyze(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    try {
      // Validate file content first
      const validation = InputValidator.validateFile(new File([content], fileName));
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          issues.push(this.createGenericIssue(
            'file-validation-error',
            'error',
            error,
            fileName
          ));
        });
        return issues;
      }

      const parsedFile = this.parseFile(fileName, content);
      const { sourceFile } = parsedFile;

      // Enhanced security checks
      issues.push(...this.findXSSVulnerabilities(sourceFile, fileName));
      issues.push(...this.findUnsafeInnerHTML(sourceFile, fileName));
      issues.push(...this.findEvalUsage(sourceFile, fileName));
      issues.push(...this.findHardcodedSecrets(sourceFile, fileName, content));
      issues.push(...this.findUnsafeURLs(sourceFile, fileName));
      issues.push(...this.findSqlInjectionRisks(sourceFile, fileName));
      issues.push(...this.findInsecureRandomness(sourceFile, fileName));
      issues.push(...this.findUnsafeFileOperations(sourceFile, fileName));

    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
      issues.push(this.createGenericIssue(
        'analysis-error',
        'warning',
        `Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fileName
      ));
    }

    return issues;
  }

  private findXSSVulnerabilities(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const jsxElements = [
      ...this.parser.findJSXElements(sourceFile),
      ...this.parser.findJSXSelfClosingElements(sourceFile)
    ];

    for (const element of jsxElements) {
      // Check for dangerouslySetInnerHTML without sanitization
      if (this.hasJSXAttribute(element, 'dangerouslySetInnerHTML')) {
        const dangerousAttr = this.getJSXAttribute(element, 'dangerouslySetInnerHTML');
        if (dangerousAttr && !this.isProperlySanitized(dangerousAttr)) {
          issues.push(this.createIssue(
            'xss-vulnerability',
            'error',
            'Potential XSS vulnerability - dangerouslySetInnerHTML without proper sanitization',
            fileName,
            element,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 1,
              suggestion: 'Use DOMPurify.sanitize() or avoid dangerouslySetInnerHTML',
              example: 'import DOMPurify from "dompurify"; const sanitizedHTML = DOMPurify.sanitize(htmlContent);'
            }
          ));
        }
      }

      // Enhanced user input detection
      if (this.hasUserInputInContent(element)) {
        issues.push(this.createIssue(
          'unescaped-user-input',
          'warning',
          'User input rendered without proper validation - potential XSS risk',
          fileName,
          element,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 1,
            suggestion: 'Validate and sanitize user input before rendering',
            example: 'Use InputValidator.sanitizeHtml() or proper validation libraries'
          }
        ));
      }
    }

    return issues;
  }

  private findSqlInjectionRisks(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const stringLiterals = this.parser.findNodes(sourceFile, ts.isStringLiteral) as ts.StringLiteral[];

    for (const literal of stringLiterals) {
      const value = literal.text;

      // Check for SQL injection patterns
      this.securityPatterns.sqlInjection.forEach(pattern => {
        if (pattern.test(value)) {
          issues.push(this.createIssue(
            'sql-injection-risk',
            'error',
            'Potential SQL injection vulnerability detected',
            fileName,
            literal,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 1,
              suggestion: 'Use parameterized queries or prepared statements',
              example: 'Use supabase.from("table").select().eq("column", value) instead of raw SQL'
            }
          ));
        }
      });
    }

    return issues;
  }

  private findInsecureRandomness(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const callExpressions = this.parser.findCallExpressions(sourceFile);

    for (const call of callExpressions) {
      if (ts.isPropertyAccessExpression(call.expression)) {
        const propertyName = call.expression.name.text;
        const objectName = call.expression.expression.getText();

        if (objectName === 'Math' && propertyName === 'random') {
          // Check if it's used for security purposes
          const parent = call.parent;
          if (parent && this.isSecuritySensitiveContext(parent)) {
            issues.push(this.createIssue(
              'insecure-randomness',
              'warning',
              'Math.random() is not cryptographically secure',
              fileName,
              call,
              sourceFile,
              {
                fixable: true,
                autoFixable: false,
                layer: 1,
                suggestion: 'Use crypto.getRandomValues() for security-sensitive randomness',
                example: 'const array = new Uint32Array(1); crypto.getRandomValues(array);'
              }
            ));
          }
        }
      }
    }

    return issues;
  }

  private findUnsafeFileOperations(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const callExpressions = this.parser.findCallExpressions(sourceFile);

    for (const call of callExpressions) {
      if (ts.isPropertyAccessExpression(call.expression)) {
        const propertyName = call.expression.name.text;

        // Check for file upload without validation
        if (propertyName === 'upload' || propertyName === 'uploadFile') {
          issues.push(this.createIssue(
            'unsafe-file-upload',
            'warning',
            'File upload without proper validation detected',
            fileName,
            call,
            sourceFile,
            {
              fixable: true,
              autoFixable: false,
              layer: 1,
              suggestion: 'Validate file type, size, and content before upload',
              example: 'Use InputValidator.validateFile() before processing uploads'
            }
          ));
        }
      }
    }

    return issues;
  }

  private isSecuritySensitiveContext(node: ts.Node): boolean {
    const text = node.getText().toLowerCase();
    const securityKeywords = ['token', 'key', 'password', 'secret', 'auth', 'session', 'nonce'];
    return securityKeywords.some(keyword => text.includes(keyword));
  }

  private isProperlySanitized(attr: ts.JsxAttribute): boolean {
    if (attr.initializer && ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
      const text = attr.initializer.expression.getText();
      return text.includes('DOMPurify.sanitize') || 
             text.includes('InputValidator.sanitizeHtml') ||
             text.includes('sanitize') || 
             text.includes('escape');
    }
    return false;
  }

  private createGenericIssue(
    type: string,
    severity: 'error' | 'warning' | 'info',
    message: string,
    fileName: string
  ): CodeIssue {
    return {
      id: this.generateId(type, fileName, 1, 1, message),
      type: type,
      severity,
      message,
      file: fileName,
      line: 1,
      column: 1,
      fixable: false,
      autoFixable: false,
      layer: 1
    };
  }

  private getJSXAttribute(element: ts.JsxElement | ts.JsxSelfClosingElement, attributeName: string): ts.JsxAttribute | null {
    const attributes = element.kind === ts.SyntaxKind.JsxElement ;
      ? element.openingElement.attributes 
      : element.attributes;

    for (const attr of attributes.properties) {
      if (ts.isJsxAttribute(attr) && ts.isIdentifier(attr.name) && attr.name.text === attributeName) {
        return attr;
      }
    }
    return null;
  }

  private hasUserInputInContent(element: ts.JsxElement | ts.JsxSelfClosingElement): boolean {
    return false;
  }

  private findUnsafeInnerHTML(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const propertyAccess = this.parser.findPropertyAccessExpressions(sourceFile);

    for (const prop of propertyAccess) {
      if (ts.isIdentifier(prop.name) && prop.name.text === 'innerHTML') {
        let parent = prop.parent;
        if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
          issues.push(this.createIssue(
            'unsafe-innerhtml',
            'error',
            'Direct innerHTML assignment is unsafe - use textContent or sanitize HTML',
            fileName,
            prop,
            sourceFile,
            {
              fixable: true,
              autoFixable: true,
              layer: 1,
              suggestion: 'Use textContent for text or sanitize HTML with DOMPurify',
              example: 'element.textContent = userInput; // or DOMPurify.sanitize(htmlContent)'
            }
          ));
        }
      }
    }

    return issues;
  }

  private findEvalUsage(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const callExpressions = this.parser.findCallExpressions(sourceFile);

    for (const call of callExpressions) {
      if (ts.isIdentifier(call.expression) && call.expression.text === 'eval') {
        issues.push(this.createIssue(
          'eval-usage',
          'error',
          'eval() is dangerous and should be avoided - code injection risk',
          fileName,
          call,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 1,
            suggestion: 'Use safer alternatives like JSON.parse() for data or Function constructor for controlled code execution',
            example: 'JSON.parse(jsonString) // for data, or use proper parsing libraries'
          }
        ));
      }
    }

    return issues;
  }

  private findHardcodedSecrets(sourceFile: ts.SourceFile, fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const lines = content.split('\n');
    lines.forEach((line, index) => {
      this.securityPatterns.secrets.forEach(pattern => {
        if (pattern.test(line)) {
          const mockNode = sourceFile.getChildren()[0] || sourceFile;
          issues.push(this.createIssue(
            'hardcoded-secrets',
            'error',
            `Potential hardcoded secret detected on line ${index + 1}`,
            fileName,
            mockNode,
            sourceFile,
            {
              fixable: false,
              autoFixable: false,
              layer: 1,
              suggestion: 'Move secrets to environment variables or secure configuration',
              example: 'Use process.env.API_KEY instead of hardcoding values'
            }
          ));
        }
      });
    });

    return issues;
  }

  private findUnsafeURLs(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    const stringLiterals = this.parser.findNodes(sourceFile, ts.isStringLiteral) as ts.StringLiteral[];

    for (const literal of stringLiterals) {
      const value = literal.text;

      if (value.startsWith('javascript:')) {
        issues.push(this.createIssue(
          'javascript-url',
          'error',
          'javascript: URLs are dangerous and can lead to XSS attacks',
          fileName,
          literal,
          sourceFile,
          {
            fixable: true,
            autoFixable: false,
            layer: 1,
            suggestion: 'Use event handlers instead of javascript: URLs',
            example: '<button onClick={handleClick}>Click me</button> instead of <a href="javascript:...">'
          }
        ));
      }

      if (value.startsWith('data:') && value.includes('script')) {
        issues.push(this.createIssue(
          'data-url-script',
          'warning',
          'data: URLs containing scripts can be security risks',
          fileName,
          literal,
          sourceFile,
          {
            fixable: false,
            autoFixable: false,
            layer: 1,
            suggestion: 'Validate and sanitize data: URL content',
            example: 'Use proper file uploads instead of data URLs for executable content'
          }
        ));
      }
    }

    return issues;
}}