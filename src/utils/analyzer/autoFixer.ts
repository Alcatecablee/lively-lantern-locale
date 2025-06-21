import { CodeIssue } from '@/types/analysis';
/**
 * Auto-Fixer Utility
 * Applies automatic fixes based on the layered analysis patterns
 * Based on the original fix-layer-*.js logic
 */
export class AutoFixer {
  static applyFix(fileName: string, content: string, issue: CodeIssue): string {
    if (!issue.autoFixable) {
      return content;
    }
    try {
      switch (issue.type) {
        case 'corruption':
          return this.fixHtmlEntityCorruption(content, issue);
        case 'import':
          return this.fixImport(content, issue);
        case 'react':
          return this.fixReact(content, issue);
        case 'component':
          return this.fixComponent(content, issue);
        case 'config':
          return this.fixConfig(content, issue);
        case 'debug':
          return this.fixDebug(content, issue);
        case 'production':
          return this.fixProduction(content, issue);
        case 'typescript':
          return this.fixTypeScript(content, issue);
        default:
          return content;
      }
    } catch (error) {
      console.error(`Error applying fix for issue ${issue.id}:`, error);
      return content;
    }
  }
  private static fixHtmlEntityCorruption(content: string, issue: CodeIssue): string {
    // Fix HTML entity quotes
    if (issue.message.includes('"')) {
      return content.replace(/"/g, '"');
    }
    if (issue.message.includes(''')) {
      return content.replace(/'/g, "'");
    }
    if (issue.message.includes('&')) {
      return content.replace(/&/g, '&');
    }
    return content;
  }
  private static fixImport(content: string, issue: CodeIssue): string {
    const lines = content.split('\n');
    if (issue.message.includes('useState') && issue.message.includes('not imported')) {
      // Add useState import
      const reactImportIndex = lines.findIndex(line => line.includes("import") && line.includes("react"));
      if (reactImportIndex !== -1) {
        const importLine = lines[reactImportIndex];
        if (importLine.includes('{') && !importLine.includes('useState')) {
          lines[reactImportIndex] = importLine.replace('{', '{ useState, ');
        }
      } else {
        // Add new import line
        lines.unshift("import { useState } from 'react';");
      }
    }
    if (issue.message.includes('useEffect') && issue.message.includes('not imported')) {
      const reactImportIndex = lines.findIndex(line => line.includes("import") && line.includes("react"));
      if (reactImportIndex !== -1) {
        const importLine = lines[reactImportIndex];
        if (importLine.includes('{') && !importLine.includes('useEffect')) {
          lines[reactImportIndex] = importLine.replace('{', '{ useEffect, ');
        }
      } else {
        lines.unshift("import { useEffect } from 'react';");
      }
    }
    // Handle other React hooks similarly
    const hooks = ['useCallback', 'useMemo', 'useContext', 'useRef'];
    hooks.forEach(hook => {
      if (issue.message.includes(hook) && issue.message.includes('not imported')) {
        const reactImportIndex = lines.findIndex(line => line.includes("import") && line.includes("react"));
        if (reactImportIndex !== -1) {
          const importLine = lines[reactImportIndex];
          if (importLine.includes('{') && !importLine.includes(hook)) {
            lines[reactImportIndex] = importLine.replace('{', `{ ${hook}, `);
          }
        } else {
          lines.unshift(`import { ${hook} } from 'react';`);
        }
      }
    });
    return lines.join('\n');
  }
  private static fixReact(content: string, issue: CodeIssue): string {
    if (issue.message.includes('React Fragment shorthand')) {
      return content
        .replace(/<React\.Fragment>/g, '<>')
        .replace(/<\/React\.Fragment>/g, '</>');
    }
    if (issue.message.includes('JSX used but React not imported')) {
      const lines = content.split('\n');
      lines.unshift("import React from 'react';");
      return lines.join('\n');
    }
    return content;
  }
  private static fixComponent(content: string, issue: CodeIssue): string {
    if (issue.message.includes('Button component should have a variant prop')) {
      return content.replace(/<Button\s+([^>]*?)>/g, (match, props) => {
        if (!props.includes('variant=')) {
          return `<Button variant="default" ${props}>`;
        }
        return match;
      });
    }
    if (issue.message.includes('Button variant') && issue.message.includes('deprecated')) {
      const variantMap = {
        'primary': 'default',
        'secondary': 'secondary',
        'danger': 'destructive',
        'success': 'default'
      };
      Object.entries(variantMap).forEach(([old, newVariant]) => {
        content = content.replace(new RegExp(`variant="${old}"`, 'g'), `variant="${newVariant}"`);
      });
    }
    if (issue.message.includes('Input component should have a type prop')) {
      return content.replace(/<Input\s+([^>]*?)>/g, (match, props) => {
        if (!props.includes('type=')) {
          return `<Input type="text" ${props}>`;
        }
        return match;
      });
    }
    if (issue.message.includes('forwardRef component should have displayName')) {
      const lines = content.split('\n');
      const forwardRefLineIndex = lines.findIndex(line => line.includes('forwardRef'));
      if (forwardRefLineIndex !== -1) {
        const componentMatch = lines[forwardRefLineIndex].match(/const\s+(\w+)\s*=.*forwardRef/);
        if (componentMatch) {
          const componentName = componentMatch[1];
          lines.splice(forwardRefLineIndex + 1, 0, `${componentName}.displayName = "${componentName}";`);
        }
      }
      return lines.join('\n');
    }
    return content;
  }
  private static fixConfig(content: string, issue: CodeIssue): string {
    if (issue.message.includes('downlevelIteration')) {
      try {
        const config = JSON.parse(content);
        if (!config.compilerOptions) config.compilerOptions = {};
        config.compilerOptions.downlevelIteration = true;
        return JSON.stringify(config, null, 2);
      } catch {
        return content;
      }
    }
    if (issue.message.includes('ES5 target')) {
      try {
        const config = JSON.parse(content);
        if (config.compilerOptions) {
          config.compilerOptions.target = "ES2020";
        }
        return JSON.stringify(config, null, 2);
      } catch {
        return content;
      }
    }
    if (issue.message.includes('path mapping')) {
      try {
        const config = JSON.parse(content);
        if (!config.compilerOptions) config.compilerOptions = {};
        config.compilerOptions.baseUrl = ".";
        config.compilerOptions.paths = { "@/*": ["./src/*"] };
        return JSON.stringify(config, null, 2);
      } catch {
        return content;
      }
    }
    if (issue.message.includes('strict mode')) {
      try {
        const config = JSON.parse(content);
        if (!config.compilerOptions) config.compilerOptions = {};
        config.compilerOptions.strict = true;
        return JSON.stringify(config, null, 2);
      } catch {
        return content;
      }
    }
    return content;
  }
  private static fixDebug(content: string, issue: CodeIssue): string {
    if (issue.message.includes('console.log')) {
      return content.replace(/console\.log\(/g, 'console.debug(');
    }
    return content;
  }
  private static fixProduction(content: string, issue: CodeIssue): string {
    if (issue.message.includes('debugger statement')) {
      return content.replace(/debugger;?/g, '// debugger; // Removed for production');
    }
    return content;
  }
  private static fixTypeScript(content: string, issue: CodeIssue): string {
    if (issue.message.includes('// @ts-ignore
')) {
      // Replace '// @ts-ignore
' with @ts-ignore comment
      return content.replace(/// @ts-ignore
/g, '// @ts-ignore\n');
    }
    return content;
  }
}
