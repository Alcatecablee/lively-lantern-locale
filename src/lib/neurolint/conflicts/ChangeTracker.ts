
import { CodeChange, ConflictDetector } from './ConflictDetector';

export interface LayerChangeReport {
  layerName: string;
  changes: CodeChange[];
  impactScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ChangeAnalysis {
  totalChanges: number;
  byLayer: Map<string, LayerChangeReport>;
  riskAssessment: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export class ChangeTracker {
  private conflictDetector = new ConflictDetector();
  private layerReports = new Map<string, LayerChangeReport>();

  trackLayerChanges(layerName: string, beforeCode: string, afterCode: string): LayerChangeReport {
    // Record changes in conflict detector
    this.conflictDetector.recordLayerChanges(layerName, beforeCode, afterCode);
    
    // Calculate detailed change report
    const changes = this.calculateDetailedChanges(beforeCode, afterCode, layerName);
    const impactScore = this.calculateImpactScore(changes);
    const riskLevel = this.assessRiskLevel(changes, impactScore);

    const report: LayerChangeReport = {
      layerName,
      changes,
      impactScore,
      riskLevel
    };

    this.layerReports.set(layerName, report);
    return report;
  }

  generateChangeAnalysis(): ChangeAnalysis {
    const totalChanges = Array.from(this.layerReports.values())
      .reduce((sum, report) => sum + report.changes.length, 0);

    const riskAssessment = this.calculateOverallRisk();
    const recommendations = this.generateRecommendations();

    return {
      totalChanges,
      byLayer: new Map(this.layerReports),
      riskAssessment,
      recommendations
    };
  }

  checkForConflicts() {
    return this.conflictDetector.detectConflicts();
  }

  private calculateDetailedChanges(beforeCode: string, afterCode: string, layerName: string): CodeChange[] {
    const changes: CodeChange[] = [];
    const beforeLines = beforeCode.split('\n');
    const afterLines = afterCode.split('\n');

    // Enhanced change detection with pattern recognition
    const maxLines = Math.max(beforeLines.length, afterLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const beforeLine = beforeLines[i] || '';
      const afterLine = afterLines[i] || '';

      if (beforeLine !== afterLine) {
        const change = this.classifyChange(beforeLine, afterLine, i + 1, layerName);
        if (change) {
          changes.push(change);
        }
      }
    }

    return changes;
  }

  private classifyChange(beforeLine: string, afterLine: string, lineNumber: number, layerName: string): CodeChange | null {
    const trimmedBefore = beforeLine.trim();
    const trimmedAfter = afterLine.trim();

    // Determine change type and node type
    let type: 'addition' | 'modification' | 'deletion';
    let nodeType: string | undefined;

    if (!trimmedBefore && trimmedAfter) {
      type = 'addition';
    } else if (trimmedBefore && !trimmedAfter) {
      type = 'deletion';
    } else {
      type = 'modification';
    }

    // Classify the type of code being changed
    if (trimmedAfter.includes('import ')) {
      nodeType = 'import';
    } else if (trimmedAfter.includes('useState') || trimmedAfter.includes('useEffect')) {
      nodeType = 'hook';
    } else if (trimmedAfter.includes('function ') || trimmedAfter.includes('const ') && trimmedAfter.includes('=>')) {
      nodeType = 'function';
    } else if (trimmedAfter.includes('<') && trimmedAfter.includes('>')) {
      nodeType = 'jsx';
    } else if (trimmedAfter.includes('interface ') || trimmedAfter.includes('type ')) {
      nodeType = 'type';
    }

    return {
      type,
      location: {
        line: lineNumber,
        column: 0,
        endLine: lineNumber,
        endColumn: afterLine.length
      },
      content: afterLine,
      layerName,
      nodeType
    };
  }

  private calculateImpactScore(changes: CodeChange[]): number {
    let score = 0;
    
    for (const change of changes) {
      // Base score per change
      score += 1;
      
      // Weight by node type
      switch (change.nodeType) {
        case 'import':
          score += 3; // High impact
          break;
        case 'function':
          score += 2; // Medium impact
          break;
        case 'hook':
          score += 2; // Medium impact
          break;
        case 'type':
          score += 1; // Low impact
          break;
        case 'jsx':
          score += 1; // Low impact
          break;
      }
      
      // Weight by change type
      switch (change.type) {
        case 'deletion':
          score += 2; // Higher risk
          break;
        case 'modification':
          score += 1;
          break;
        case 'addition':
          score += 0.5;
          break;
      }
    }
    
    return score;
  }

  private assessRiskLevel(changes: CodeChange[], impactScore: number): 'low' | 'medium' | 'high' {
    // High risk thresholds
    if (impactScore > 15 || changes.some(c => c.nodeType === 'import' && c.type === 'deletion')) {
      return 'high';
    }
    
    // Medium risk thresholds
    if (impactScore > 8 || changes.filter(c => c.nodeType === 'function').length > 2) {
      return 'medium';
    }
    
    return 'low';
  }

  private calculateOverallRisk(): 'low' | 'medium' | 'high' {
    const riskLevels = Array.from(this.layerReports.values()).map(r => r.riskLevel);
    
    if (riskLevels.includes('high')) return 'high';
    if (riskLevels.includes('medium')) return 'medium';
    return 'low';
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const reports = Array.from(this.layerReports.values());
    
    // High-risk layer recommendations
    const highRiskLayers = reports.filter(r => r.riskLevel === 'high');
    if (highRiskLayers.length > 0) {
      recommendations.push(`Review high-risk layers: ${highRiskLayers.map(l => l.layerName).join(', ')}`);
    }
    
    // Import change recommendations
    const hasImportChanges = reports.some(r => 
      r.changes.some(c => c.nodeType === 'import')
    );
    if (hasImportChanges) {
      recommendations.push('Validate import integrity after transformation');
    }
    
    // Function modification recommendations
    const hasFunctionChanges = reports.some(r => 
      r.changes.some(c => c.nodeType === 'function' && c.type !== 'addition')
    );
    if (hasFunctionChanges) {
      recommendations.push('Test function modifications for breaking changes');
    }
    
    return recommendations;
  }

  clearTracking(): void {
    this.layerReports.clear();
    this.conflictDetector.clearLayerChanges();
  }
}
