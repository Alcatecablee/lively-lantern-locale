import { BaseAnalyzer } from '../baseAnalyzer';
import { CodeIssue } from '@/types/analysis';
import * as ts from 'typescript';
/**
 * Layer 3: Component-Specific Fixes
 * - Button component variants and props
 * - Tabs component props and structure
 * - Form component enhancements
 * - Icon component standardization
 * - Layout component optimizations
 */
export class Layer3ComponentsAnalyzer extends BaseAnalyzer {
  analyze(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    // Only analyze React component files
    if (!fileName.endsWith('.tsx') && !fileName.endsWith('.jsx')) {
      return issues;
    }
    try {
      const parsed = this.parseFile(fileName, content);
      const sourceFile = parsed.sourceFile;
      // Check Button components
      issues.push(...this.checkButtonComponents(sourceFile, fileName));
      // Check form components
      issues.push(...this.checkFormComponents(sourceFile, fileName));
      // Check component prop interfaces
      issues.push(...this.checkComponentInterfaces(sourceFile, fileName));
      // Check for missing displayName in forwardRef components
      issues.push(...this.checkForwardRefComponents(sourceFile, fileName));
    } catch (error) {
      // Skip files that can't be parsed
    }
    return issues;
  }
  private checkButtonComponents(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const content = sourceFile.getFullText();
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      // Check for Button without variant prop
      const buttonMatch = line.match(/<Button\s+([^>]*?)>/);
      if (buttonMatch && !buttonMatch[1].includes('variant=')) {
        issues.push({
          id: this.generateId('button-missing-variant', fileName, lineNum, 1, 'Button missing variant'),
          type: 'component',
          severity: 'warning',
          message: 'Button component should have a variant prop for consistent styling',
          line: lineNum,
          column: line.indexOf('<Button') + 1,
          file: fileName,
          fixable: true,
          autoFixable: true,
          layer: 3,
          suggestion: 'Add variant prop to Button component',
          example: '<Button variant="default" ...>'
        });
      }
      // Check for deprecated Button variants
      const variantMatch = line.match(/variant="(primary|secondary|danger|success)"/);
      if (variantMatch) {
        const oldVariant = variantMatch[1];
        const newVariant = this.mapButtonVariant(oldVariant);
        issues.push({
          id: this.generateId('button-deprecated-variant', fileName, lineNum, 1, `Deprecated variant ${oldVariant}`),
          type: 'component',
          severity: 'warning',
          message: `Button variant "${oldVariant}" is deprecated, use "${newVariant}" instead`,
          line: lineNum,
          column: line.indexOf(`variant="${oldVariant}"`) + 1,
          file: fileName,
          fixable: true,
          autoFixable: true,
          layer: 3,
          suggestion: `Replace variant="${oldVariant}" with variant="${newVariant}"`,
          example: `variant="${newVariant}"`
        });
      }
    });
    return issues;
  }
  private checkFormComponents(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const content = sourceFile.getFullText();
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      // Check for Input without type prop
      const inputMatch = line.match(/<Input\s+([^>]*?)>/);
      if (inputMatch && !inputMatch[1].includes('type=')) {
        issues.push({
          id: this.generateId('input-missing-type', fileName, lineNum, 1, 'Input missing type'),
          type: 'component',
          severity: 'warning',
          message: 'Input component should have a type prop for accessibility and validation',
          line: lineNum,
          column: line.indexOf('<Input') + 1,
          file: fileName,
          fixable: true,
          autoFixable: true,
          layer: 3,
          suggestion: 'Add type prop to Input component',
          example: '<Input type="text" ...>'
        });
      }
      // Check for FormField without proper structure
      if (line.includes('<FormField') && !content.includes('FormControl')) {
        issues.push({
          id: this.generateId('form-field-structure', fileName, lineNum, 1, 'FormField missing structure'),
          type: 'component',
          severity: 'warning',
          message: 'FormField should contain FormControl for proper structure',
          line: lineNum,
          column: line.indexOf('<FormField') + 1,
          file: fileName,
          fixable: false,
          autoFixable: false,
          layer: 3,
          suggestion: 'Wrap form elements with FormControl inside FormField'
        });
      }
    });
    return issues;
  }
  private checkComponentInterfaces(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    // Find interface declarations that look like component props
    const interfaces = this.findInterfaceDeclarations(sourceFile);
    interfaces.forEach(interfaceDecl => {
      if (interfaceDecl.name && interfaceDecl.name.text.endsWith('Props')) {
        const interfaceText = interfaceDecl.getFullText();
        // Check if it extends HTMLAttributes for better DOM prop support
        if (!interfaceText.includes('extends') && !interfaceText.includes('HTMLAttributes')) {
          const position = this.parser.getLineAndColumn(sourceFile, interfaceDecl.getStart());
          issues.push({
            id: this.generateId('component-props-interface', fileName, position.line, position.column, 'Props interface missing extends'),
            type: 'component',
            severity: 'info',
            message: 'Component Props interface should extend HTMLAttributes for better DOM prop support',
            line: position.line,
            column: position.column,
            file: fileName,
            fixable: true,
            autoFixable: false,
            layer: 3,
            suggestion: 'Extend React.HTMLAttributes<HTMLDivElement> or appropriate HTML element',
            example: 'interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {'
          });
        }
      }
    });
    return issues;
  }
  private checkForwardRefComponents(sourceFile: ts.SourceFile, fileName: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const content = sourceFile.getFullText();
    // Check for forwardRef without displayName
    if (content.includes('forwardRef') && !content.includes('.displayName')) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('forwardRef')) {
          const lineNum = index + 1;
          // Try to extract component name
          const componentMatch = line.match(/const\s+(\w+)\s*=.*forwardRef/);
          if (componentMatch) {
            const componentName = componentMatch[1];
            issues.push({
              id: this.generateId('forwardref-displayname', fileName, lineNum, 1, 'ForwardRef missing displayName'),
              type: 'component',
              severity: 'warning',
              message: 'forwardRef component should have displayName for better debugging',
              line: lineNum,
              column: line.indexOf('forwardRef') + 1,
              file: fileName,
              fixable: true,
              autoFixable: true,
              layer: 3,
              suggestion: `Add ${componentName}.displayName = "${componentName}";`,
              example: `${componentName}.displayName = "${componentName}";`
            });
          }
        }
      });
    }
    return issues;
  }
  private findInterfaceDeclarations(sourceFile: ts.SourceFile): ts.InterfaceDeclaration[] {
    const interfaces: ts.InterfaceDeclaration[] = [];
    function visit(node: ts.Node) {
      if (ts.isInterfaceDeclaration(node)) {
        interfaces.push(node);
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return interfaces;
  }
  private mapButtonVariant(oldVariant: string): string {
    const variantMap = {
      'primary': 'default',
      'secondary': 'secondary',
      'danger': 'destructive',
      'success': 'default'
    };
    return variantMap[oldVariant] || 'default';
  }
}