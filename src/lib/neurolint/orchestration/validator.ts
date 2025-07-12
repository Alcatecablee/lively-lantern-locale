
/**
 * Transformation Validator
 * Validates code transformations to prevent corruption
 */

export class TransformationValidator {
  static validateTransformation(before: string, after: string): { shouldRevert: boolean; reason?: string } {
    // Syntax validation
    if (this.hasSyntaxErrors(after)) {
      return { shouldRevert: true, reason: 'Syntax errors detected in transformed code' };
    }

    // Import/export validation
    if (this.hasImportExportIssues(after)) {
      return { shouldRevert: true, reason: 'Import/export structure corrupted' };
    }

    // Component structure validation
    if (this.hasComponentStructureIssues(before, after)) {
      return { shouldRevert: true, reason: 'Component structure integrity compromised' };
    }

    return { shouldRevert: false };
  }

  private static hasSyntaxErrors(code: string): boolean {
    // Check for unclosed brackets, parentheses, etc.
    const brackets = { '{': '}', '(': ')', '[': ']' };
    const stack: string[] = [];
    
    for (const char of code) {
      if (char in brackets) {
        stack.push(brackets[char as keyof typeof brackets]);
      } else if (Object.values(brackets).includes(char)) {
        if (stack.pop() !== char) return true;
      }
    }
    
    return stack.length > 0;
  }

  private static hasImportExportIssues(code: string): boolean {
    // Check for malformed imports
    const importPattern = /import\s*{[^}]*$/m;
    if (importPattern.test(code)) return true;

    // Check for missing export statements in component files
    if (code.includes('function ') && code.includes('return <') && !code.includes('export')) {
      return true;
    }

    return false;
  }

  private static hasComponentStructureIssues(before: string, after: string): boolean {
    const beforeComponents = this.extractComponentNames(before);
    const afterComponents = this.extractComponentNames(after);
    
    // Check if components were accidentally removed
    return beforeComponents.some(comp => !afterComponents.includes(comp));
  }

  private static extractComponentNames(code: string): string[] {
    const componentPattern = /(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/g;
    const matches = [];
    let match;
    
    while ((match = componentPattern.exec(code)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }
}
