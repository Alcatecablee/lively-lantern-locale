import { createWriteStream, WriteStream } from 'fs';
import { join } from 'path';
import { performance } from 'perf_hooks';

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  performance?: {
    duration: number;
    memory: number;
    cpu: number;
  };
}

interface Transport {
  write(entry: LogEntry): void;
  flush?(): Promise<void>;
}

class ConsoleTransport implements Transport {
  write(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const performance = entry.performance
      ? ` [${entry.performance.duration}ms, ${Math.round(entry.performance.memory / 1024 / 1024)}MB]`
      : '';
    
    const message = `${timestamp} [${entry.level.toUpperCase()}]${performance} ${entry.message}`;
    
    switch (entry.level) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'info':
        console.info(message);
        break;
      default:
        console.log(message);
    }
  }
}

class FileTransport implements Transport {
  private stream: WriteStream;
  private queue: string[] = [];
  private flushInterval: NodeJS.Timeout;

  constructor(filename: string) {
    this.stream = createWriteStream(filename, { flags: 'a' });
    this.flushInterval = setInterval(() => this.flush(), 1000);
  }

  write(entry: LogEntry): void {
    const line = JSON.stringify({
      ...entry,
      timestamp: new Date(entry.timestamp).toISOString()
    }) + '\n';
    
    this.queue.push(line);
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    return new Promise<void>((resolve, reject) => {
      const data = this.queue.join('');
      this.queue = [];
      
      this.stream.write(data, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  destroy(): void {
    clearInterval(this.flushInterval);
    this.stream.end();
  }
}

class MetricsTransport implements Transport {
  private metrics: {
    requestCount: number;
    errorCount: number;
    warningCount: number;
    averageDuration: number;
    peakMemory: number;
    totalDuration: number;
  };

  constructor() {
    this.resetMetrics();
  }

  write(entry: LogEntry): void {
    this.metrics.requestCount++;
    
    if (entry.level === 'error') this.metrics.errorCount++;
    if (entry.level === 'warn') this.metrics.warningCount++;
    
    if (entry.performance) {
      this.metrics.totalDuration += entry.performance.duration;
      this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.requestCount;
      this.metrics.peakMemory = Math.max(this.metrics.peakMemory, entry.performance.memory);
    }
  }

  getMetrics(): Record<string, number> {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      warningCount: 0,
      averageDuration: 0,
      peakMemory: 0,
      totalDuration: 0
    };
  }
}

export class Logger {
  private transports: Transport[] = [];
  private performanceMarks: Map<string, number> = new Map();
  private metricsTransport: MetricsTransport;

  constructor(logDir?: string) {
    // Always add console transport
    this.transports.push(new ConsoleTransport());
    
    // Add file transport if log directory is provided
    if (logDir) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.transports.push(
        new FileTransport(join(logDir, `neurolint-${timestamp}.log`))
      );
    }

    // Add metrics transport
    this.metricsTransport = new MetricsTransport();
    this.transports.push(this.metricsTransport);
  }

  private async log(level: LogEntry['level'], message: string, context?: Record<string, any>): Promise<void> {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context
    };

    // Add performance data if available
    const mark = this.performanceMarks.get(message);
    if (mark) {
      entry.performance = {
        duration: performance.now() - mark,
        memory: process.memoryUsage().heapUsed,
        cpu: process.cpuUsage().user
      };
      this.performanceMarks.delete(message);
    }

    // Write to all transports
    await Promise.all(
      this.transports.map(transport => {
        try {
          transport.write(entry);
          return transport.flush?.();
        } catch (error) {
          console.error('Transport error:', error);
        }
      })
    );
  }

  startTimer(label: string): void {
    this.performanceMarks.set(label, performance.now());
  }

  debug(message: string, context?: Record<string, any>): Promise<void> {
    return this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): Promise<void> {
    return this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): Promise<void> {
    return this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): Promise<void> {
    return this.log('error', message, context);
  }

  getMetrics(): Record<string, number> {
    return this.metricsTransport.getMetrics();
  }

  resetMetrics(): void {
    this.metricsTransport.resetMetrics();
  }

  async destroy(): Promise<void> {
    await Promise.all(
      this.transports
        .filter((t): t is FileTransport => t instanceof FileTransport)
        .map(t => t.destroy())
    );
  }
} 