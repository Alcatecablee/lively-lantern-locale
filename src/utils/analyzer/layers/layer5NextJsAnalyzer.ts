import { BaseAnalyzer } from '../baseAnalyzer';
import { CodeIssue } from '@/types/analysis';
/**
 * Layer 5: Next.js App Router Fixes
 * - App directory structure
 * - Route handlers
 * - Layout patterns
 * - Metadata API
 */
export class Layer5NextJsAnalyzer extends BaseAnalyzer {
  analyze(fileName: string, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    // Check for 'use client' directive placement
    if (content.includes("'use client'") || content.includes('"use client"')) {
      const lines = content.split('\n');
      const useClientLine = lines.findIndex(line => 
        line.trim() === "'use client';" || line.trim() === '"use client";'
      );
      if (useClientLine > 0) {
        // Check if there are non-comment, non-import lines before 'use client'
        const linesBefore = lines.slice(0, useClientLine);
        const hasContentBefore = linesBefore.some(line => {
          const trimmed = line.trim();
          return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('import');
        });
        if (hasContentBefore) {
          issues.push({
            id: this.generateId('use-client-placement', fileName, useClientLine + 1, 1, 'Use client misplaced'),
            type: 'nextjs',
            severity: 'error',
            message: '"use client" directive must be at the top of the file before any imports',
            line: useClientLine + 1,
            column: 1,
            file: fileName,
            fixable: true,
            autoFixable: true,
            layer: 5,
            suggestion: 'Move "use client" to the top of the file',
            example: '"use client";\n\nimport ...'
          });
        }
      }
    }
    // Check for app directory patterns
    if (fileName.includes('/app/') && fileName.endsWith('page.tsx')) {
      if (!content.includes('export default')) {
        issues.push({
          id: this.generateId('page-default-export', fileName, 1, 1, 'Page missing default export'),
          type: 'nextjs',
          severity: 'error',
          message: 'App Router page components must have a default export',
          line: 1,
          column: 1,
          file: fileName,
          fixable: false,
          autoFixable: false,
          layer: 5,
          suggestion: 'Add default export to page component'
        });
      }
    }
    return issues;
  }
}