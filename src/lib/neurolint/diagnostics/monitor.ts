
/**
 * Diagnostic monitoring system
 */
export class DiagnosticMonitor {
  private static executionLog: any[] = [];

  static recordExecution(data: {
    layerId: number;
    success: boolean;
    executionTime: number;
    codeLength: number;
    errorCategory?: string;
  }): void {
    this.executionLog.push({
      ...data,
      timestamp: Date.now()
    });
  }

  static getReport(): any {
    return {
      totalExecutions: this.executionLog.length,
      successRate: this.executionLog.filter(e => e.success).length / this.executionLog.length,
      averageExecutionTime: this.executionLog.reduce((sum, e) => sum + e.executionTime, 0) / this.executionLog.length,
      recentExecutions: this.executionLog.slice(-10)
    };
  }
}
