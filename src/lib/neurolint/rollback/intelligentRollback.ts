interface TransformationSnapshot {
  id: string;
  layerId: number;
  layerName: string;
  beforeCode: string;
  afterCode: string;
  timestamp: number;
  confidence: number;
  validationResult: any;
  metadata: {
    changeCount: number;
    improvements: string[];
    risks: string[];
  };
}

interface RollbackDecision {
  shouldRollback: boolean;
  reason: string;
  confidence: number;
  suggestedAction: 'rollback' | 'partial-rollback' | 'accept' | 'manual-review';
}

export class IntelligentRollback {
  private snapshots: TransformationSnapshot[] = [];
  private rollbackThreshold = 0.6; // Confidence threshold for automatic rollback
  
  createSnapshot(
    layerId: number,
    layerName: string,
    beforeCode: string,
    afterCode: string,
    validationResult: any
  ): string {
    const snapshot: TransformationSnapshot = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      layerId,
      layerName,
      beforeCode,
      afterCode,
      timestamp: Date.now(),
      confidence: validationResult.confidence || 0,
      validationResult,
      metadata: {
        changeCount: this.calculateChanges(beforeCode, afterCode),
        improvements: this.detectImprovements(beforeCode, afterCode),
        risks: this.assessRisks(beforeCode, afterCode, validationResult)
      }
    };
    
    this.snapshots.push(snapshot);
    return snapshot.id;
  }
  
  evaluateRollback(snapshotId: string): RollbackDecision {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      return {
        shouldRollback: true,
        reason: 'Snapshot not found',
        confidence: 1.0,
        suggestedAction: 'rollback'
      };
    }
    
    return this.makeRollbackDecision(snapshot);
  }
  
  private makeRollbackDecision(snapshot: TransformationSnapshot): RollbackDecision {
    const { confidence, validationResult, metadata } = snapshot;
    
    // Critical errors always trigger rollback
    if (validationResult.errors?.some((e: any) => e.severity === 'error')) {
      return {
        shouldRollback: true,
        reason: 'Critical errors detected in transformation',
        confidence: 1.0,
        suggestedAction: 'rollback'
      };
    }
    
    // Low confidence transformations
    if (confidence < this.rollbackThreshold) {
      const reason = this.determineConfidenceIssue(snapshot);
      return {
        shouldRollback: true,
        reason,
        confidence: 1 - confidence,
        suggestedAction: confidence < 0.3 ? 'rollback' : 'manual-review'
      };
    }
    
    // Risk assessment
    const riskScore = this.calculateRiskScore(metadata.risks);
    if (riskScore > 0.7) {
      return {
        shouldRollback: true,
        reason: `High risk transformation detected: ${metadata.risks.join(', ')}`,
        confidence: riskScore,
        suggestedAction: 'manual-review'
      };
    }
    
    // Excessive changes without clear improvements
    if (metadata.changeCount > 50 && metadata.improvements.length === 0) {
      return {
        shouldRollback: true,
        reason: 'Extensive changes without clear benefits',
        confidence: 0.8,
        suggestedAction: 'partial-rollback'
      };
    }
    
    // Accept transformation
    return {
      shouldRollback: false,
      reason: 'Transformation appears safe and beneficial',
      confidence,
      suggestedAction: 'accept'
    };
  }
  
  private determineConfidenceIssue(snapshot: TransformationSnapshot): string {
    const { validationResult, metadata } = snapshot;
    
    if (validationResult.warnings?.length > 3) {
      return 'Multiple warnings detected in transformation';
    }
    
    if (metadata.changeCount > 100) {
      return 'Extensive code changes reduce confidence';
    }
    
    if (metadata.risks.includes('functionality-change')) {
      return 'Potential functionality changes detected';
    }
    
    return 'Low confidence in transformation safety';
  }
  
  private calculateRiskScore(risks: string[]): number {
    const riskWeights: Record<string, number> = {
      'functionality-removed': 0.9,
      'breaking-change': 0.8,
      'security-concern': 0.8,
      'performance-regression': 0.6,
      'accessibility-loss': 0.7,
      'type-safety-reduced': 0.5
    };
    
    let totalRisk = 0;
    risks.forEach(risk => {
      totalRisk += riskWeights[risk] || 0.3;
    });
    
    return Math.min(1.0, totalRisk);
  }
  
  performRollback(snapshotId: string, action: 'full' | 'partial'): {
    success: boolean;
    restoredCode: string;
    message: string;
  } {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      return {
        success: false,
        restoredCode: '',
        message: 'Snapshot not found for rollback'
      };
    }
    
    if (action === 'full') {
      return {
        success: true,
        restoredCode: snapshot.beforeCode,
        message: `Rolled back layer ${snapshot.layerName} completely`
      };
    } else {
      // Partial rollback - try to preserve beneficial changes
      const restoredCode = this.performPartialRollback(snapshot);
      return {
        success: true,
        restoredCode,
        message: `Partially rolled back layer ${snapshot.layerName}, preserving safe changes`
      };
    }
  }
  
  private performPartialRollback(snapshot: TransformationSnapshot): string {
    const { beforeCode, afterCode, metadata } = snapshot;
    
    // Simple heuristic: if there are clear improvements, try to preserve them
    if (metadata.improvements.length > 0 && metadata.risks.length === 0) {
      // For now, return the transformed code since risks are low
      return afterCode;
    }
    
    // Otherwise, rollback completely
    return beforeCode;
  }
  
  private calculateChanges(before: string, after: string): number {
    const beforeLines = before.split('\n');
    const afterLines = after.split('\n');
    let changes = Math.abs(beforeLines.length - afterLines.length);
    
    const minLength = Math.min(beforeLines.length, afterLines.length);
    for (let i = 0; i < minLength; i++) {
      if (beforeLines[i] !== afterLines[i]) changes++;
    }
    
    return changes;
  }
  
  private detectImprovements(before: string, after: string): string[] {
    const improvements: string[] = [];
    
    // Check for added error handling
    if (!before.includes('try {') && after.includes('try {')) {
      improvements.push('Added error handling');
    }
    
    // Check for added accessibility
    if (!before.includes('aria-') && after.includes('aria-')) {
      improvements.push('Improved accessibility');
    }
    
    // Check for performance optimizations
    if (!before.includes('useMemo') && after.includes('useMemo')) {
      improvements.push('Added performance optimization');
    }
    
    // Check for TypeScript improvements
    if (before.includes(': any') && !after.includes(': any')) {
      improvements.push('Improved type safety');
    }
    
    return improvements;
  }
  
  private assessRisks(before: string, after: string, validationResult: any): string[] {
    const risks: string[] = [];
    
    // Check for removed functionality
    if (validationResult.errors?.some((e: any) => e.type === 'functionality-removed')) {
      risks.push('functionality-removed');
    }
    
    // Check for major structural changes
    const beforeFunctions = (before.match(/function \w+/g) || []).length;
    const afterFunctions = (after.match(/function \w+/g) || []).length;
    
    if (Math.abs(beforeFunctions - afterFunctions) > 2) {
      risks.push('breaking-change');
    }
    
    // Check for security concerns
    if (after.includes('eval(') || after.includes('innerHTML')) {
      risks.push('security-concern');
    }
    
    // Check for type safety reduction
    if (!before.includes(': any') && after.includes(': any')) {
      risks.push('type-safety-reduced');
    }
    
    return risks;
  }
  
  getSnapshotHistory(): TransformationSnapshot[] {
    return [...this.snapshots].sort((a, b) => b.timestamp - a.timestamp);
  }
  
  clearHistory(): void {
    this.snapshots = [];
  }
}
