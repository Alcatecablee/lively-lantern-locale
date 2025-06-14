export interface LayerSnapshot {
  layerName: string;
  code: string;
  timestamp: number;
  fingerprint: string;
  metadata: {
    changeCount: number;
    transformationTime: number;
    contractResults?: any;
  };
}

export interface RollbackResult {
  success: boolean;
  restoredToLayer: string;
  code: string;
  reason: string;
  alternatives?: string[];
}

export interface RollbackStrategy {
  type: 'single_layer' | 'cascade' | 'selective' | 'complete';
  description: string;
}

export class RollbackManager {
  private snapshots: LayerSnapshot[] = [];
  private maxSnapshots = 10;

  captureSnapshot(layerName: string, code: string, fingerprint: string, metadata: any): void {
    const snapshot: LayerSnapshot = {
      layerName,
      code,
      timestamp: Date.now(),
      fingerprint,
      metadata
    };

    this.snapshots.push(snapshot);

    // Keep only the most recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }
  }

  determineRollbackStrategy(conflicts: any[], failedLayer: string): RollbackStrategy {
    const conflictSeverity = this.calculateConflictSeverity(conflicts);
    const hasMultipleConflicts = conflicts.length > 1;
    const hasCascadingEffects = this.detectCascadingEffects(failedLayer);

    if (conflictSeverity === 'high' || hasCascadingEffects) {
      return {
        type: 'cascade',
        description: 'High severity conflicts detected, rolling back multiple layers'
      };
    }

    if (hasMultipleConflicts) {
      return {
        type: 'selective',
        description: 'Multiple conflicts detected, selectively rolling back conflicting changes'
      };
    }

    return {
      type: 'single_layer',
      description: 'Single layer rollback to resolve isolated conflict'
    };
  }

  executeRollback(strategy: RollbackStrategy, targetLayer?: string): RollbackResult {
    switch (strategy.type) {
      case 'single_layer':
        return this.rollbackSingleLayer(targetLayer);
      
      case 'cascade':
        return this.rollbackCascade(targetLayer);
      
      case 'selective':
        return this.rollbackSelective(targetLayer);
      
      case 'complete':
        return this.rollbackComplete();
      
      default:
        return {
          success: false,
          restoredToLayer: '',
          code: '',
          reason: 'Unknown rollback strategy'
        };
    }
  }

  private rollbackSingleLayer(targetLayer?: string): RollbackResult {
    if (!targetLayer) {
      const lastSnapshot = this.getLastSuccessfulSnapshot();
      if (!lastSnapshot) {
        return {
          success: false,
          restoredToLayer: '',
          code: '',
          reason: 'No previous snapshots available'
        };
      }
      
      return {
        success: true,
        restoredToLayer: lastSnapshot.layerName,
        code: lastSnapshot.code,
        reason: `Rolled back to last successful state: ${lastSnapshot.layerName}`
      };
    }

    const snapshot = this.findSnapshotByLayer(targetLayer);
    if (!snapshot) {
      return {
        success: false,
        restoredToLayer: '',
        code: '',
        reason: `No snapshot found for layer: ${targetLayer}`
      };
    }

    return {
      success: true,
      restoredToLayer: snapshot.layerName,
      code: snapshot.code,
      reason: `Rolled back to layer: ${targetLayer}`
    };
  }

  private rollbackCascade(fromLayer?: string): RollbackResult {
    const fromIndex = fromLayer ? 
      this.snapshots.findIndex(s => s.layerName === fromLayer) : 
      this.snapshots.length - 2; // Go back 2 layers
    
    if (fromIndex === -1 || fromIndex === 0) {
      return this.rollbackComplete();
    }

    const targetSnapshot = this.snapshots[fromIndex - 1];
    return {
      success: true,
      restoredToLayer: targetSnapshot.layerName,
      code: targetSnapshot.code,
      reason: `Cascade rollback from ${fromLayer || 'current'} to ${targetSnapshot.layerName}`
    };
  }

  private rollbackSelective(targetLayer?: string): RollbackResult {
    // For now, implement as single layer rollback
    // In a more sophisticated version, this would selectively undo specific changes
    return this.rollbackSingleLayer(targetLayer);
  }

  private rollbackComplete(): RollbackResult {
    if (this.snapshots.length === 0) {
      return {
        success: false,
        restoredToLayer: '',
        code: '',
        reason: 'No snapshots available for complete rollback'
      };
    }

    const firstSnapshot = this.snapshots[0];
    return {
      success: true,
      restoredToLayer: firstSnapshot.layerName,
      code: firstSnapshot.code,
      reason: 'Complete rollback to initial state'
    };
  }

  private getLastSuccessfulSnapshot(): LayerSnapshot | null {
    // Return the second-to-last snapshot (assuming the last one might be the failed one)
    return this.snapshots.length >= 2 ? 
      this.snapshots[this.snapshots.length - 2] : 
      this.snapshots[this.snapshots.length - 1] || null;
  }

  private findSnapshotByLayer(layerName: string): LayerSnapshot | null {
    return this.snapshots.find(s => s.layerName === layerName) || null;
  }

  private calculateConflictSeverity(conflicts: any[]): 'low' | 'medium' | 'high' {
    if (conflicts.some(c => c.severity === 'high')) return 'high';
    if (conflicts.some(c => c.severity === 'medium')) return 'medium';
    return 'low';
  }

  private detectCascadingEffects(layerName: string): boolean {
    // Simple heuristic: if the layer affects imports or core functionality
    const cascadingLayers = ['layer-2-entities', 'layer-3-components'];
    return cascadingLayers.includes(layerName);
  }

  getSnapshotHistory(): LayerSnapshot[] {
    return [...this.snapshots];
  }

  clearSnapshots(): void {
    this.snapshots = [];
  }
}
