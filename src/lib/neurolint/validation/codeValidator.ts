
export class CodeValidator {
  static compareBeforeAfter(before: string, after: string): {
    shouldRevert: boolean;
    reason?: string;
  } {
    // Don't revert if no changes were made
    if (before === after) {
      return { shouldRevert: false };
    }

    // Check for common corruption patterns
    if (this.hasCorruption(after)) {
      return { 
        shouldRevert: true, 
        reason: 'Code corruption detected' 
      };
    }

    // Check for syntax destruction
    if (this.hasSyntaxErrors(after)) {
      return { 
        shouldRevert: true, 
        reason: 'Syntax errors introduced' 
      };
    }

    // Check for excessive changes (>50% of lines changed might indicate corruption)
    const beforeLines = before.split('\n').length;
    const afterLines = after.split('\n').length;
    const lineDiff = Math.abs(beforeLines - afterLines);
    const percentChange = (lineDiff / beforeLines) * 100;

    if (percentChange > 50) {
      console.warn(`Large change detected: ${percentChange.toFixed(1)}% line difference`);
      // Don't auto-revert large changes, just warn
    }

    return { shouldRevert: false };
  }

  private static hasCorruption(code: string): boolean {
    // Check for obvious corruption patterns
    const corruptionPatterns = [
      /undefined[^\w].*undefined/g, // Multiple undefined values
      /\[object Object\]/g, // Stringified objects
      /NaN/g, // NaN values
      /null.*null.*null/g, // Multiple null values
    ];

    return corruptionPatterns.some(pattern => pattern.test(code));
  }

  private static hasSyntaxErrors(code: string): boolean {
    // Basic syntax checks
    const syntaxIssues = [
      // Unmatched brackets
      this.hasUnmatchedBrackets(code),
      // Invalid JSX
      this.hasInvalidJSX(code),
    ];

    return syntaxIssues.some(issue => issue);
  }

  private static hasUnmatchedBrackets(code: string): boolean {
    const brackets = { '(': 0, '[': 0, '{': 0 };
    
    for (const char of code) {
      if (char === '(') brackets['(']++;
      if (char === ')') brackets['(']--;
      if (char === '[') brackets['[']++;
      if (char === ']') brackets['[']--;
      if (char === '{') brackets['{']++;
      if (char === '}') brackets['{']--;
    }

    return Object.values(brackets).some(count => count !== 0);
  }

  private static hasInvalidJSX(code: string): boolean {
    // Check for common JSX issues
    const jsxIssues = [
      /<[^>]*[^\/]>.*<\/[^>]*>/g, // Unclosed tags (basic check)
    ];

    // This is a very basic check - in a real implementation you'd want
    // to use a proper JSX parser
    return false; // For now, don't block on JSX issues
  }
}
