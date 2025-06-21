import { EventEmitter } from 'events';

export interface ErrorDetails {
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
  layer?: number;
  severity: 'error' | 'warning' | 'info';
  recoverable: boolean;
  timestamp: number;
  context?: Record<string, any>;
}

export class ErrorTracker extends EventEmitter {
  private errors: Map<string, ErrorDetails[]> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private recoveryStrategies: Map<string, () => Promise<void>> = new Map();
  
  constructor() {
    super();
    this.setupDefaultRecoveryStrategies();
  }

  track(error: ErrorDetails): void {
    const errors = this.errors.get(error.code) || [];
    errors.push(error);
    this.errors.set(error.code, errors);
    
    const count = this.errorCounts.get(error.code) || 0;
    this.errorCounts.set(error.code, count + 1);

    this.emit('error', error);

    if (error.recoverable && this.recoveryStrategies.has(error.code)) {
      this.attemptRecovery(error);
    }
  }

  async attemptRecovery(error: ErrorDetails): Promise<boolean> {
    const strategy = this.recoveryStrategies.get(error.code);
    if (!strategy) return false;

    try {
      await strategy();
      this.emit('recovery', { error, success: true });
      return true;
    } catch (recoveryError) {
      this.emit('recovery', { error, success: false, reason: recoveryError });
      return false;
    }
  }

  getErrorSummary(): Record<string, any> {
    return {
      totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
      errorsByType: Object.fromEntries(this.errorCounts),
      mostCommonErrors: this.getMostCommonErrors(5),
      recoveryRate: this.calculateRecoveryRate(),
      errorTrends: this.analyzeErrorTrends()
    };
  }

  private getMostCommonErrors(limit: number): Array<{ code: string; count: number }> {
    return Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([code, count]) => ({ code, count }));
  }

  private calculateRecoveryRate(): number {
    const recoverableErrors = Array.from(this.errors.values())
      .flat()
      .filter(e => e.recoverable);
    
    const successfulRecoveries = recoverableErrors.filter(e => {
      const attempts = this.errors.get(e.code) || [];
      return attempts.some(a => a.timestamp > e.timestamp);
    });

    return recoverableErrors.length > 0
      ? successfulRecoveries.length / recoverableErrors.length
      : 1;
  }

  private analyzeErrorTrends(): Record<string, any> {
    const timeWindows = [
      { name: 'last_hour', ms: 3600000 },
      { name: 'last_day', ms: 86400000 },
      { name: 'last_week', ms: 604800000 }
    ];

    const now = Date.now();
    const trends: Record<string, any> = {};

    for (const window of timeWindows) {
      const errorsInWindow = Array.from(this.errors.values())
        .flat()
        .filter(e => now - e.timestamp < window.ms);

      trends[window.name] = {
        total: errorsInWindow.length,
        by_severity: this.groupBySeverity(errorsInWindow),
        by_type: this.groupByErrorCode(errorsInWindow)
      };
    }

    return trends;
  }

  private groupBySeverity(errors: ErrorDetails[]): Record<string, number> {
    return errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByErrorCode(errors: ErrorDetails[]): Record<string, number> {
    return errors.reduce((acc, error) => {
      acc[error.code] = (acc[error.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private setupDefaultRecoveryStrategies(): void {
    // AST parsing errors
    this.recoveryStrategies.set('AST_PARSE_ERROR', async () => {
      // Fallback to regex-based transformation
      this.emit('fallback', { type: 'regex_transform' });
    });

    // Missing dependency errors
    this.recoveryStrategies.set('MISSING_DEPENDENCY', async () => {
      // Auto-install missing dependency
      this.emit('fallback', { type: 'install_dependency' });
    });

    // File system errors
    this.recoveryStrategies.set('FS_ERROR', async () => {
      // Retry with elevated permissions
      this.emit('fallback', { type: 'retry_elevated' });
    });

    // Memory errors
    this.recoveryStrategies.set('MEMORY_ERROR', async () => {
      // Free up memory and retry
      this.emit('fallback', { type: 'gc_and_retry' });
    });
  }

  addRecoveryStrategy(errorCode: string, strategy: () => Promise<void>): void {
    this.recoveryStrategies.set(errorCode, strategy);
  }

  clearErrors(): void {
    this.errors.clear();
    this.errorCounts.clear();
    this.emit('clear');
  }
} 