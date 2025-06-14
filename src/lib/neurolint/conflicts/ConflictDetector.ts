import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ast/ASTTransformer';

export interface CodeChange {
  type: 'addition' | 'modification' | 'deletion';
  location: {
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
  };
  content: string;
  layerName: string;
  nodeType?: string;
}

export interface ConflictResult {
  hasConflicts: boolean;
  conflicts: Conflict[];
  severity: 'low' | 'medium' | 'high';
}

export interface Conflict {
  type: 'overlapping_changes' | 'semantic_conflict' | 'import_conflict' | 'syntax_breaking';
  layers: string[];
  location: { line: number; column: number };
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

export class ConflictDetector {
  private transformer = new ASTTransformer();
  private layerChanges = new Map<string, CodeChange[]>();

  recordLayerChanges(layerName: string, beforeCode: string, afterCode: string): void {
    const changes = this.calculateChanges(beforeCode, afterCode, layerName);
    this.layerChanges.set(layerName, changes);
  }

  detectConflicts(): ConflictResult {
    const conflicts: Conflict[] = [];
    const layerNames = Array.from(this.layerChanges.keys());

    // Check for overlapping line changes - but ignore benign overlaps
    for (let i = 0; i < layerNames.length; i++) {
      for (let j = i + 1; j < layerNames.length; j++) {
        const layer1Changes = this.layerChanges.get(layerNames[i]) || [];
        const layer2Changes = this.layerChanges.get(layerNames[j]) || [];
        
        const overlappingConflicts = this.findOverlappingChanges(
          layer1Changes, 
          layer2Changes, 
          layerNames[i], 
          layerNames[j]
        );
        
        // Filter out benign conflicts
        const significantConflicts = overlappingConflicts.filter(conflict => 
          !this.isBenignConflict(conflict, layer1Changes, layer2Changes)
        );
        
        conflicts.push(...significantConflicts);
      }
    }

    // Check for semantic conflicts
    const semanticConflicts = this.findSemanticConflicts();
    conflicts.push(...semanticConflicts);

    // Check for import conflicts
    const importConflicts = this.findImportConflicts();
    conflicts.push(...importConflicts);

    const severity = this.calculateOverallSeverity(conflicts);

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      severity
    };
  }

  private calculateChanges(beforeCode: string, afterCode: string, layerName: string): CodeChange[] {
    const changes: CodeChange[] = [];
    const beforeLines = beforeCode.split('\n');
    const afterLines = afterCode.split('\n');

    // Simple line-by-line diff
    const maxLines = Math.max(beforeLines.length, afterLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const beforeLine = beforeLines[i] || '';
      const afterLine = afterLines[i] || '';

      if (beforeLine !== afterLine) {
        if (!beforeLine && afterLine) {
          // Addition
          changes.push({
            type: 'addition',
            location: { line: i + 1, column: 0, endLine: i + 1, endColumn: afterLine.length },
            content: afterLine,
            layerName
          });
        } else if (beforeLine && !afterLine) {
          // Deletion
          changes.push({
            type: 'deletion',
            location: { line: i + 1, column: 0, endLine: i + 1, endColumn: beforeLine.length },
            content: beforeLine,
            layerName
          });
        } else if (beforeLine && afterLine) {
          // Modification
          changes.push({
            type: 'modification',
            location: { line: i + 1, column: 0, endLine: i + 1, endColumn: afterLine.length },
            content: afterLine,
            layerName
          });
        }
      }
    }

    return changes;
  }

  private findOverlappingChanges(
    changes1: CodeChange[], 
    changes2: CodeChange[], 
    layer1: string, 
    layer2: string
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    for (const change1 of changes1) {
      for (const change2 of changes2) {
        if (this.changesOverlap(change1, change2)) {
          conflicts.push({
            type: 'overlapping_changes',
            layers: [layer1, layer2],
            location: { line: change1.location.line, column: change1.location.column },
            description: `${layer1} and ${layer2} both modify line ${change1.location.line}`,
            severity: this.calculateConflictSeverity(change1, change2),
            suggestion: `Consider applying ${layer1} changes first, then reviewing ${layer2} changes`
          });
        }
      }
    }

    return conflicts;
  }

  private changesOverlap(change1: CodeChange, change2: CodeChange): boolean {
    return !(
      change1.location.endLine < change2.location.line ||
      change2.location.endLine < change1.location.line
    );
  }

  private calculateConflictSeverity(change1: CodeChange, change2: CodeChange): 'low' | 'medium' | 'high' {
    // High severity if both are modifications to the same line
    if (change1.type === 'modification' && change2.type === 'modification' && 
        change1.location.line === change2.location.line) {
      return 'high';
    }
    
    // Medium severity if one modifies what the other adds/deletes
    if ((change1.type === 'addition' && change2.type === 'deletion') ||
        (change1.type === 'deletion' && change2.type === 'addition')) {
      return 'medium';
    }
    
    return 'low';
  }

  private isBenignConflict(conflict: Conflict, changes1: CodeChange[], changes2: CodeChange[]): boolean {
    // Check if both changes are adding the same 'use client' directive
    const change1 = changes1.find(c => c.location.line === conflict.location.line);
    const change2 = changes2.find(c => c.location.line === conflict.location.line);
    
    if (change1 && change2) {
      const isUseClientConflict = 
        (change1.content.includes("'use client'") && change2.content.includes("'use client'")) ||
        (change1.content.trim() === change2.content.trim()); // Identical changes
      
      if (isUseClientConflict) {
        return true;
      }
    }
    
    return false;
  }

  private findSemanticConflicts(): Conflict[] {
    const conflicts: Conflict[] = [];
    
    // Check for duplicate 'use client' additions across layers
    const useClientLayers: string[] = [];
    
    this.layerChanges.forEach((changes, layerName) => {
      const hasUseClientAddition = changes.some(change => 
        change.type === 'addition' && change.content.includes("'use client'")
      );
      
      if (hasUseClientAddition) {
        useClientLayers.push(layerName);
      }
    });
    
    if (useClientLayers.length > 1) {
      conflicts.push({
        type: 'semantic_conflict',
        layers: useClientLayers,
        location: { line: 1, column: 1 },
        description: `Multiple layers (${useClientLayers.join(', ')}) are adding 'use client' directive`,
        severity: 'low', // This is actually harmless but worth noting
        suggestion: 'Consolidate use client directive handling to a single layer'
      });
    }
    
    return conflicts;
  }

  private findImportConflicts(): Conflict[] {
    const conflicts: Conflict[] = [];
    // Implementation for import conflict detection
    // This would check for conflicting import statements across layers
    return conflicts;
  }

  private calculateOverallSeverity(conflicts: Conflict[]): 'low' | 'medium' | 'high' {
    if (conflicts.some(c => c.severity === 'high')) return 'high';
    if (conflicts.some(c => c.severity === 'medium')) return 'medium';
    return 'low';
  }

  clearLayerChanges(): void {
    this.layerChanges.clear();
  }
}
