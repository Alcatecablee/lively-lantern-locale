import { NeuroLintLayerResult } from '../types';

interface ExecutionRecord {
  timestamp: Date;
  results: NeuroLintLayerResult[];
  totalTime: number;
  success: boolean;
}

export class DiagnosticMonitor {
  private static executions: ExecutionRecord[] = [];

  static recordExecution(
    results: NeuroLintLayerResult[], 
    totalTime: number, 
    success: boolean
  ): void {
    const record: ExecutionRecord = {
      timestamp: new Date(),
      results,
      totalTime,
      success
    };

    this.executions.push(record);

    // Keep only the last 50 executions
    if (this.executions.length > 50) {
      this.executions = this.executions.slice(-50);
    }
  }

  static createRealTimeReport(): string {
    if (this.executions.length === 0) {
      return "No executions recorded yet.";
    }

    const recent = this.executions.slice(-5);
    const successRate = (recent.filter(e => e.success).length / recent.length) * 100;
    const avgTime = recent.reduce((sum, e) => sum + e.totalTime, 0) / recent.length;

    return `📊 Recent Performance:
  Success Rate: ${successRate.toFixed(1)}%
  Average Time: ${avgTime.toFixed(0)}ms
  Recent Executions: ${recent.length}`;
  }

  static getExecutionHistory(): ExecutionRecord[] {
    return [...this.executions];
  }

  static clearHistory(): void {
    this.executions = [];
  }
}
