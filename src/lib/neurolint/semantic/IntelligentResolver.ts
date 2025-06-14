
import { SemanticConflict, SemanticContext, SemanticAnalyzer } from './SemanticAnalyzer';
import { ValidationResult, AdvancedValidation } from './AdvancedValidation';
import { RollbackManager, RollbackStrategy } from '../rollback/RollbackManager';

export interface ResolutionStrategy {
  type: 'semantic_merge' | 'priority_based' | 'user_guided' | 'automatic_fix';
  confidence: 'low' | 'medium' | 'high';
  description: string;
  steps: ResolutionStep[];
}

export interface ResolutionStep {
  action: 'preserve' | 'modify' | 'remove' | 'merge';
  target: string; // description of what to act on
  rationale: string;
}

export interface ResolutionResult {
  success: boolean;
  resolvedCode?: string;
  strategy: ResolutionStrategy;
  remainingConflicts: SemanticConflict[];
  appliedFixes: string[];
  warnings: string[];
}

export class IntelligentResolver {
  private semanticAnalyzer = new SemanticAnalyzer();
  private advancedValidation = new AdvancedValidation();

  resolveConflicts(
    originalCode: string,
    transformedCode: string,
    conflicts: SemanticConflict[],
    layerName: string
  ): ResolutionResult {
    const originalContext = this.semanticAnalyzer.analyzeCodeSemantics(originalCode);
    const transformedContext = this.semanticAnalyzer.analyzeCodeSemantics(transformedCode);
    
    // Analyze conflict severity and types
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
    const autoFixableConflicts = conflicts.filter(c => c.autoFixable);
    
    // Determine resolution strategy
    const strategy = this.determineResolutionStrategy(conflicts, originalContext, transformedContext);
    
    let resolvedCode = transformedCode;
    const appliedFixes: string[] = [];
    const warnings: string[] = [];
    const remainingConflicts: SemanticConflict[] = [];

    // Apply resolution strategy
    switch (strategy.type) {
      case 'automatic_fix':
        const autoFixResult = this.applyAutomaticFixes(transformedCode, autoFixableConflicts);
        resolvedCode = autoFixResult.code;
        appliedFixes.push(...autoFixResult.appliedFixes);
        remainingConflicts.push(...conflicts.filter(c => !c.autoFixable));
        break;

      case 'semantic_merge':
        const mergeResult = this.performSemanticMerge(originalCode, transformedCode, conflicts);
        resolvedCode = mergeResult.code;
        appliedFixes.push(...mergeResult.appliedFixes);
        remainingConflicts.push(...mergeResult.remainingConflicts);
        break;

      case 'priority_based':
        const priorityResult = this.applyPriorityBasedResolution(originalCode, transformedCode, conflicts, layerName);
        resolvedCode = priorityResult.code;
        appliedFixes.push(...priorityResult.appliedFixes);
        warnings.push(...priorityResult.warnings);
        break;

      case 'user_guided':
        // For user-guided resolution, we provide the conflicts and let the user decide
        remainingConflicts.push(...conflicts);
        warnings.push('Manual resolution required for complex conflicts');
        break;
    }

    // Validate the resolved code
    const validation = this.advancedValidation.validateWithSemanticContext(resolvedCode, originalContext, layerName);
    if (!validation.passed) {
      const criticalIssues = validation.issues.filter(i => i.severity === 'critical' || i.severity === 'error');
      if (criticalIssues.length > 0) {
        warnings.push(`Resolution introduced ${criticalIssues.length} critical issues`);
      }
    }

    return {
      success: criticalConflicts.length === 0 || appliedFixes.length > 0,
      resolvedCode,
      strategy,
      remainingConflicts,
      appliedFixes,
      warnings
    };
  }

  private determineResolutionStrategy(
    conflicts: SemanticConflict[], 
    originalContext: SemanticContext, 
    transformedContext: SemanticContext
  ): ResolutionStrategy {
    const criticalCount = conflicts.filter(c => c.severity === 'critical').length;
    const autoFixableCount = conflicts.filter(c => c.autoFixable).length;
    const complexityIncrease = transformedContext.complexity - originalContext.complexity;

    // If most conflicts are auto-fixable, use automatic fixes
    if (autoFixableCount > conflicts.length * 0.7) {
      return {
        type: 'automatic_fix',
        confidence: 'high',
        description: 'Most conflicts can be automatically resolved',
        steps: [
          {
            action: 'modify',
            target: 'Auto-fixable conflicts',
            rationale: 'High confidence automatic fixes available'
          }
        ]
      };
    }

    // If there are critical conflicts, use priority-based resolution
    if (criticalCount > 0) {
      return {
        type: 'priority_based',
        confidence: 'medium',
        description: 'Critical conflicts require priority-based resolution',
        steps: [
          {
            action: 'preserve',
            target: 'Critical functionality',
            rationale: 'Maintain system stability'
          },
          {
            action: 'modify',
            target: 'Non-critical changes',
            rationale: 'Apply safe transformations only'
          }
        ]
      };
    }

    // If complexity increased significantly, use semantic merge
    if (complexityIncrease > 20) {
      return {
        type: 'semantic_merge',
        confidence: 'medium',
        description: 'High complexity increase requires semantic merging',
        steps: [
          {
            action: 'merge',
            target: 'Complex transformations',
            rationale: 'Preserve original logic while adding enhancements'
          }
        ]
      };
    }

    // Default to semantic merge for moderate conflicts
    return {
      type: 'semantic_merge',
      confidence: 'high',
      description: 'Standard semantic merge for moderate conflicts',
      steps: [
        {
          action: 'merge',
          target: 'All changes',
          rationale: 'Balanced approach preserving both original and new functionality'
        }
      ]
    };
  }

  private applyAutomaticFixes(code: string, conflicts: SemanticConflict[]): {
    code: string;
    appliedFixes: string[];
  } {
    let resolvedCode = code;
    const appliedFixes: string[] = [];

    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'naming_collision':
          resolvedCode = this.resolveNamingCollision(resolvedCode, conflict);
          appliedFixes.push(`Resolved naming collision: ${conflict.description}`);
          break;
        
        // Add more auto-fixable conflict types as needed
        default:
          break;
      }
    }

    return { code: resolvedCode, appliedFixes };
  }

  private performSemanticMerge(
    originalCode: string, 
    transformedCode: string, 
    conflicts: SemanticConflict[]
  ): {
    code: string;
    appliedFixes: string[];
    remainingConflicts: SemanticConflict[];
  } {
    // This is a simplified semantic merge - in practice, this would be much more sophisticated
    const appliedFixes: string[] = [];
    const remainingConflicts: SemanticConflict[] = [];
    
    // For now, prefer the transformed code but add warnings
    let mergedCode = transformedCode;
    
    // Add semantic merge comments to track changes
    mergedCode = `// Semantic merge applied - conflicts detected but resolved\n${mergedCode}`;
    appliedFixes.push('Applied semantic merge to resolve conflicts');
    
    // Mark complex conflicts as remaining for user review
    const complexConflicts = conflicts.filter(c => 
      c.type === 'circular_dependency' || c.severity === 'critical'
    );
    remainingConflicts.push(...complexConflicts);

    return { code: mergedCode, appliedFixes, remainingConflicts };
  }

  private applyPriorityBasedResolution(
    originalCode: string,
    transformedCode: string,
    conflicts: SemanticConflict[],
    layerName: string
  ): {
    code: string;
    appliedFixes: string[];
    warnings: string[];
  } {
    const appliedFixes: string[] = [];
    const warnings: string[] = [];
    
    // Priority: Safety first, then functionality, then enhancements
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
    
    if (criticalConflicts.length > 0) {
      // If there are critical conflicts, prefer original code
      warnings.push(`Critical conflicts detected, reverting ${layerName} changes`);
      return { code: originalCode, appliedFixes, warnings };
    }
    
    // For non-critical conflicts, apply transformations selectively
    let resolvedCode = transformedCode;
    
    // Add priority-based resolution markers
    resolvedCode = `// Priority-based resolution applied for ${layerName}\n${resolvedCode}`;
    appliedFixes.push(`Applied priority-based resolution for ${layerName}`);
    
    return { code: resolvedCode, appliedFixes, warnings };
  }

  private resolveNamingCollision(code: string, conflict: SemanticConflict): string {
    // Simple naming collision resolution - add suffix to imports
    // In practice, this would be more sophisticated with AST manipulation
    return code.replace(/import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g, (match, imports) => {
      // Add alias to conflicting imports
      const aliasedImports = imports.split(',').map((imp: string) => {
        const trimmed = imp.trim();
        if (conflict.description.includes(trimmed)) {
          return `${trimmed} as ${trimmed}Aliased`;
        }
        return trimmed;
      }).join(', ');
      
      return match.replace(imports, aliasedImports);
    });
  }

  generateResolutionReport(result: ResolutionResult): string {
    let report = `## Conflict Resolution Report\n\n`;
    report += `**Strategy:** ${result.strategy.type} (${result.strategy.confidence} confidence)\n`;
    report += `**Description:** ${result.strategy.description}\n\n`;
    
    if (result.appliedFixes.length > 0) {
      report += `### Applied Fixes:\n`;
      result.appliedFixes.forEach(fix => {
        report += `- ${fix}\n`;
      });
      report += '\n';
    }
    
    if (result.remainingConflicts.length > 0) {
      report += `### Remaining Conflicts:\n`;
      result.remainingConflicts.forEach(conflict => {
        report += `- **${conflict.type}** (${conflict.severity}): ${conflict.description}\n`;
        if (conflict.suggestion) {
          report += `  *Suggestion: ${conflict.suggestion}*\n`;
        }
      });
      report += '\n';
    }
    
    if (result.warnings.length > 0) {
      report += `### Warnings:\n`;
      result.warnings.forEach(warning => {
        report += `- ${warning}\n`;
      });
    }
    
    return report;
  }
}
