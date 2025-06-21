import { BaseAnalyzer } from '../baseAnalyzer';
import { CodeIssue } from '@/types/analysis';
import * as ts from 'typescript';
/**
 * Layer 1: Configuration Fixes
 * - TypeScript configuration optimization
 * - Next.js configuration cleanup
 * - Package.json optimization
 * - Critical setup issues
 */
export class Layer1ConfigAnalyzer extends BaseAnalyzer {
  analyze(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    // Check TypeScript configuration files
    if (fileName.endsWith('tsconfig.json')) {
      issues.push(...this.analyzeTsConfig(fileName, content));
    }
    // Check Next.js configuration files
    if (fileName.endsWith('next.config.js') || fileName.endsWith('next.config.ts')) {
      issues.push(...this.analyzeNextConfig(fileName, content));
    }
    // Check package.json files
    if (fileName.endsWith('package.json')) {
      issues.push(...this.analyzePackageJson(fileName, content));
    }
    // Check for critical TypeScript issues in source files
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) {
      issues.push(...this.analyzeTypeScriptIssues(fileName, content));
    }
    return issues;
  }
  private analyzeTsConfig(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    try {
      const config = JSON.parse(content);
      const compilerOptions = config.compilerOptions || {};
      // Check for missing downlevelIteration
      if (!compilerOptions.downlevelIteration) {
        issues.push({
          id: this.generateId('tsconfig-downlevel', fileName, 1, 1, 'Missing downlevelIteration'),
          type: 'config',
          severity: 'error',
          message: 'Missing downlevelIteration option in TypeScript configuration',
          line: 1,
          column: 1,
          file: fileName,
          fixable: true,
          autoFixable: true,
          layer: 1,
          suggestion: 'Add "downlevelIteration": true to compilerOptions',
          example: '"compilerOptions": { "downlevelIteration": true }'
        });
      }
      // Check for outdated target
      if (compilerOptions.target === 'es5' || compilerOptions.target === 'ES5') {
        issues.push({
          id: this.generateId('tsconfig-target', fileName, 1, 1, 'Outdated ES5 target'),
          type: 'config',
          severity: 'error',
          message: 'Outdated ES5 target - should use ES2020 or higher for modern features',
          line: 1,
          column: 1,
          file: fileName,
          fixable: true,
          autoFixable: true,
          layer: 1,
          suggestion: 'Update target to "ES2020" or higher',
          example: '"target": "ES2020"'
        });
      }
      // Check for missing path mapping
      if (!compilerOptions.baseUrl || !compilerOptions.paths) {
        issues.push({
          id: this.generateId('tsconfig-paths', fileName, 1, 1, 'Missing path mapping'),
          type: 'config',
          severity: 'warning',
          message: 'Missing path mapping configuration for cleaner imports',
          line: 1,
          column: 1,
          file: fileName,
          fixable: true,
          autoFixable: true,
          layer: 1,
          suggestion: 'Add baseUrl and paths for @/* mapping',
          example: '"baseUrl": ".", "paths": { "@/*": ["./src/*"] }'
        });
      }
      // Check for missing strict mode
      if (!compilerOptions.strict) {
        issues.push({
          id: this.generateId('tsconfig-strict', fileName, 1, 1, 'Missing strict mode'),
          type: 'config',
          severity: 'warning',
          message: 'TypeScript strict mode not enabled',
          line: 1,
          column: 1,
          file: fileName,
          fixable: true,
          autoFixable: true,
          layer: 1,
          suggestion: 'Enable strict mode for better type safety',
          example: '"strict": true'
        });
      }
    } catch (error) {
      issues.push({
        id: this.generateId('tsconfig-invalid', fileName, 1, 1, 'Invalid JSON'),
        type: 'config',
        severity: 'error',
        message: 'Invalid JSON in TypeScript configuration file',
        line: 1,
        column: 1,
        file: fileName,
        fixable: false,
        autoFixable: false,
        layer: 1,
        suggestion: 'Fix JSON syntax errors'
      });
    }
    return issues;
  }
  private analyzeNextConfig(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    // Check for deprecated appDir option
    if (content.includes('appDir')) {
      issues.push({
        id: this.generateId('nextjs-appdir', fileName, 1, 1, 'Deprecated appDir'),
        type: 'config',
        severity: 'warning',
        message: 'Deprecated appDir option in experimental configuration',
        line: 1,
        column: 1,
        file: fileName,
        fixable: true,
        autoFixable: true,
        layer: 1,
        suggestion: 'Remove appDir from experimental options',
        example: 'experimental: { // Remove appDir }'
      });
    }
    // Check for missing swcMinify
    if (!content.includes('swcMinify')) {
      issues.push({
        id: this.generateId('nextjs-swc', fileName, 1, 1, 'Missing SWC minification'),
        type: 'config',
        severity: 'info',
        message: 'Consider enabling SWC minification for better performance',
        line: 1,
        column: 1,
        file: fileName,
        fixable: true,
        autoFixable: true,
        layer: 1,
        suggestion: 'Add swcMinify: true for better performance',
        example: 'swcMinify: true'
      });
    }
    return issues;
  }
  private analyzePackageJson(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    try {
      const pkg = JSON.parse(content);
      // Check for missing essential scripts
      const essentialScripts = ['dev', 'build', 'start', 'lint'];
      const scripts = pkg.scripts || {};
      essentialScripts.forEach(script => {
        if (!scripts[script]) {
          issues.push({
            id: this.generateId('package-script', fileName, 1, 1, `Missing ${script} script`),
            type: 'config',
            severity: 'warning',
            message: `Missing essential script: ${script}`,
            line: 1,
            column: 1,
            file: fileName,
            fixable: true,
            autoFixable: true,
            layer: 1,
            suggestion: `Add ${script} script to package.json`,
            example: `"${script}": "next ${script}"`
          });
        }
      });
      // Check for outdated dependencies (basic check)
      const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
      if (dependencies.react && dependencies.react.startsWith('^16')) {
        issues.push({
          id: this.generateId('package-react-old', fileName, 1, 1, 'Outdated React version'),
          type: 'config',
          severity: 'warning',
          message: 'React version is outdated (v16), consider upgrading to v18+',
          line: 1,
          column: 1,
          file: fileName,
          fixable: true,
          autoFixable: false,
          layer: 1,
          suggestion: 'Upgrade React to latest stable version'
        });
      }
    } catch (error) {
      issues.push({
        id: this.generateId('package-invalid', fileName, 1, 1, 'Invalid JSON'),
        type: 'config',
        severity: 'error',
        message: 'Invalid JSON in package.json file',
        line: 1,
        column: 1,
        file: fileName,
        fixable: false,
        autoFixable: false,
        layer: 1,
        suggestion: 'Fix JSON syntax errors'
      });
    }
    return issues;
  }
  private analyzeTypeScriptIssues(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    try {
      const parsed = this.parseFile(fileName, content);
      const sourceFile = parsed.sourceFile;
      // Check for missing React import in TSX files
      if (fileName.endsWith('.tsx') && !this.isReactImported(sourceFile)) {
        // Only flag if JSX is used but React isn't imported
        const hasJSX = this.hasJSXElements(sourceFile);
        if (hasJSX) {
          issues.push(this.createIssue(
            'missing-react-import',
            'error',
            'JSX used but React not imported',
            fileName,
            sourceFile,
            sourceFile,
            {
              fixable: true,
              autoFixable: true,
              layer: 1,
              suggestion: 'Import React at the top of the file',
              example: 'import React from "react";'
            }
          ));
        }
      }
      // Check for any type usage without proper imports
      this.checkTypeImports(sourceFile, fileName, issues);
    } catch (error) {
      // Silently skip files that can't be parsed
    }
    return issues;
  }
  private hasJSXElements(sourceFile: ts.SourceFile): boolean {
    let hasJSX = false;
    function visit(node: ts.Node) {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        hasJSX = true;
        return;
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return hasJSX;
  }
  private checkTypeImports(sourceFile: ts.SourceFile, fileName: string, issues: CodeIssue[]): void {
    // Check for common missing type imports
    const content = sourceFile.getFullText();
    const commonTypes = ['ReactNode', 'ReactElement', 'FC', 'ComponentType'];
    commonTypes.forEach(type => {
      if (content.includes(type) && !content.includes(`import.*${type}`)) {
        issues.push(this.createIssue(
          'missing-type-import',
          'error',
          `Type '${type}' used but not imported`,
          fileName,
          sourceFile,
          sourceFile,
          {
            fixable: true,
            autoFixable: true,
            layer: 1,
            suggestion: `Import ${type} from React`,
            example: `import { ${type} } from 'react';`
          }
        ));
      }
    });
  }
}