
import { SemanticContext, SemanticConflict, SemanticAnalyzer } from './SemanticAnalyzer';
import { QualityGates } from '../contracts/QualityGates';

export interface ValidationResult {
  passed: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  recommendations: string[];
  autoFixes: AutoFix[];
}

export interface ValidationIssue {
  type: 'performance' | 'accessibility' | 'maintainability' | 'security' | 'best_practice';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  location?: { line: number; column: number };
  rule: string;
}

export interface AutoFix {
  description: string;
  changes: CodeChange[];
  confidence: 'low' | 'medium' | 'high';
}

export interface CodeChange {
  type: 'replace' | 'insert' | 'delete';
  startLine: number;
  endLine: number;
  newContent?: string;
}

export class AdvancedValidation {
  private semanticAnalyzer = new SemanticAnalyzer();

  validateWithSemanticContext(
    code: string, 
    originalContext?: SemanticContext,
    layerName?: string
  ): ValidationResult {
    const context = this.semanticAnalyzer.analyzeCodeSemantics(code);
    const syntaxValidation = QualityGates.validateSyntax(code);
    
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];
    const autoFixes: AutoFix[] = [];

    // Basic syntax validation
    if (!syntaxValidation.valid) {
      issues.push({
        type: 'best_practice',
        severity: 'critical',
        message: `Syntax error: ${syntaxValidation.error}`,
        rule: 'syntax_validation'
      });
    }

    // Semantic integrity validation
    const semanticValidation = this.semanticAnalyzer.validateSemanticIntegrity(code, context);
    if (!semanticValidation.valid) {
      semanticValidation.issues.forEach(issue => {
        issues.push({
          type: 'maintainability',
          severity: 'warning',
          message: issue,
          rule: 'semantic_integrity'
        });
      });
    }

    // Performance validations
    this.validatePerformance(code, context, issues, recommendations, autoFixes);
    
    // Accessibility validations
    this.validateAccessibility(code, context, issues, recommendations, autoFixes);
    
    // Security validations
    this.validateSecurity(code, context, issues, recommendations);
    
    // Best practices validations
    this.validateBestPractices(code, context, issues, recommendations, autoFixes);

    // Check for semantic conflicts if we have original context
    if (originalContext && layerName) {
      const conflicts = this.semanticAnalyzer.detectSemanticConflicts(originalContext, context, layerName);
      conflicts.forEach(conflict => {
        issues.push({
          type: 'maintainability',
          severity: conflict.severity === 'critical' ? 'critical' : 'warning',
          message: conflict.description,
          location: conflict.location,
          rule: `semantic_conflict_${conflict.type}`
        });
        
        if (conflict.autoFixable) {
          recommendations.push(conflict.suggestion);
        }
      });
    }

    // Calculate score
    const score = this.calculateValidationScore(issues, context);

    return {
      passed: issues.filter(i => i.severity === 'error' || i.severity === 'critical').length === 0,
      score,
      issues,
      recommendations,
      autoFixes
    };
  }

  private validatePerformance(
    code: string, 
    context: SemanticContext, 
    issues: ValidationIssue[], 
    recommendations: string[],
    autoFixes: AutoFix[]
  ): void {
    // Check for unoptimized re-renders
    if (context.riskFactors.includes('inline_object_props') && context.hasState) {
      issues.push({
        type: 'performance',
        severity: 'warning',
        message: 'Inline objects in props may cause unnecessary re-renders',
        rule: 'avoid_inline_objects'
      });
      recommendations.push('Move object definitions outside render or use useMemo');
      
      autoFixes.push({
        description: 'Extract inline objects to useMemo hooks',
        changes: [], // Would be populated with actual change locations
        confidence: 'medium'
      });
    }

    // Check for unoptimized loops in render
    if (context.riskFactors.includes('unoptimized_render_loops')) {
      issues.push({
        type: 'performance',
        severity: 'warning',
        message: 'Array operations in render should be memoized',
        rule: 'memoize_render_calculations'
      });
      recommendations.push('Wrap expensive calculations in useMemo or move outside component');
    }

    // Check component complexity
    if (context.complexity > 50) {
      issues.push({
        type: 'performance',
        severity: 'warning',
        message: `High component complexity (${context.complexity}). Consider splitting into smaller components`,
        rule: 'component_complexity'
      });
      recommendations.push('Break down complex components into smaller, focused components');
    }

    // Check for missing React.memo on functional components with props
    if (context.componentType === 'functional' && !code.includes('memo(') && !code.includes('React.memo')) {
      const hasProps = code.includes('props') || code.includes('({') && code.includes('})');
      if (hasProps && context.complexity > 20) {
        issues.push({
          type: 'performance',
          severity: 'info',
          message: 'Consider wrapping component in React.memo for better performance',
          rule: 'consider_memo'
        });
      }
    }
  }

  private validateAccessibility(
    code: string, 
    context: SemanticContext, 
    issues: ValidationIssue[], 
    recommendations: string[],
    autoFixes: AutoFix[]
  ): void {
    // Check for missing alt attributes
    if (code.includes('<img') && !code.includes('alt=')) {
      issues.push({
        type: 'accessibility',
        severity: 'error',
        message: 'Images must have alt attributes for accessibility',
        rule: 'img_alt_required'
      });
      
      autoFixes.push({
        description: 'Add alt attributes to images',
        changes: [], // Would be populated with actual locations
        confidence: 'high'
      });
    }

    // Check for clickable elements without accessible labels
    if (code.includes('onClick') && !code.includes('aria-label') && !code.includes('aria-labelledby')) {
      const hasTextContent = />[^<]+</.test(code); // Simple check for text content
      if (!hasTextContent) {
        issues.push({
          type: 'accessibility',
          severity: 'warning',
          message: 'Interactive elements should have accessible labels',
          rule: 'interactive_label_required'
        });
        recommendations.push('Add aria-label or aria-labelledby to interactive elements');
      }
    }

    // Check for form inputs without labels
    if (code.includes('<input') && !code.includes('aria-label') && !code.includes('<label')) {
      issues.push({
        type: 'accessibility',
        severity: 'error',
        message: 'Form inputs must have associated labels',
        rule: 'input_label_required'
      });
    }

    // Check for missing focus management
    if (context.hasState && context.hasEffects && code.includes('modal') || code.includes('dialog')) {
      if (!code.includes('focus') && !code.includes('useRef')) {
        issues.push({
          type: 'accessibility',
          severity: 'warning',
          message: 'Modal/dialog components should manage focus properly',
          rule: 'focus_management'
        });
        recommendations.push('Implement focus trapping and restoration for modal components');
      }
    }
  }

  private validateSecurity(code: string, context: SemanticContext, issues: ValidationIssue[], recommendations: string[]): void {
    // Check for dangerouslySetInnerHTML
    if (code.includes('dangerouslySetInnerHTML')) {
      issues.push({
        type: 'security',
        severity: 'warning',
        message: 'dangerouslySetInnerHTML can lead to XSS vulnerabilities',
        rule: 'avoid_dangerous_html'
      });
      recommendations.push('Sanitize HTML content or use safer alternatives');
    }

    // Check for direct localStorage usage without SSR protection
    if (code.includes('localStorage') && !code.includes('typeof window')) {
      issues.push({
        type: 'security',
        severity: 'error',
        message: 'localStorage usage should be protected for SSR compatibility',
        rule: 'ssr_safe_storage'
      });
    }

    // Check for hardcoded secrets (simple patterns)
    const secretPatterns = [/api[_-]?key/i, /secret/i, /password/i, /token/i];
    secretPatterns.forEach(pattern => {
      if (pattern.test(code) && /['"`][^'"`]{20,}['"`]/.test(code)) {
        issues.push({
          type: 'security',
          severity: 'critical',
          message: 'Potential hardcoded secret detected',
          rule: 'no_hardcoded_secrets'
        });
        recommendations.push('Move secrets to environment variables');
      }
    });
  }

  private validateBestPractices(
    code: string, 
    context: SemanticContext, 
    issues: ValidationIssue[], 
    recommendations: string[],
    autoFixes: AutoFix[]
  ): void {
    // Check for missing key props in lists
    if (code.includes('.map(') && !code.includes('key=')) {
      issues.push({
        type: 'best_practice',
        severity: 'warning',
        message: 'List items should have unique key props',
        rule: 'missing_key_props'
      });
      
      autoFixes.push({
        description: 'Add key props to list items',
        changes: [], // Would be populated with actual changes
        confidence: 'high'
      });
    }

    // Check for missing dependencies in useEffect
    if (code.includes('useEffect') && context.hasState) {
      // This would need AST analysis for proper detection
      recommendations.push('Verify useEffect dependencies are complete and correct');
    }

    // Check for proper TypeScript usage
    if (!code.includes('interface') && !code.includes('type') && context.componentType === 'functional') {
      if (code.includes('props') || code.includes('({')) {
        issues.push({
          type: 'best_practice',
          severity: 'info',
          message: 'Consider adding TypeScript interfaces for props',
          rule: 'typescript_interfaces'
        });
      }
    }

    // Check for error boundaries
    if (context.riskFactors.includes('async_operations') && !context.riskFactors.includes('error_handling')) {
      issues.push({
        type: 'best_practice',
        severity: 'warning',
        message: 'Components with async operations should have error handling',
        rule: 'error_handling_required'
      });
      recommendations.push('Add error boundaries or try-catch blocks for async operations');
    }

    // Check for proper component naming
    if (context.componentType === 'functional') {
      const componentName = this.extractComponentName(code);
      if (componentName && !/^[A-Z]/.test(componentName)) {
        issues.push({
          type: 'best_practice',
          severity: 'warning',
          message: 'Component names should start with a capital letter',
          rule: 'component_naming'
        });
      }
    }
  }

  private calculateValidationScore(issues: ValidationIssue[], context: SemanticContext): number {
    let score = 100;
    
    // Deduct points based on issue severity
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 25; break;
        case 'error': score -= 15; break;
        case 'warning': score -= 5; break;
        case 'info': score -= 1; break;
      }
    });

    // Bonus points for good practices
    if (context.riskFactors.includes('error_handling')) score += 5;
    if (context.complexity < 20) score += 5;
    if (context.componentType === 'functional') score += 2;

    return Math.max(0, Math.min(100, score));
  }

  private extractComponentName(code: string): string | null {
    const match = code.match(/(?:function|const)\s+([A-Za-z][A-Za-z0-9]*)/);
    return match ? match[1] : null;
  }
}
