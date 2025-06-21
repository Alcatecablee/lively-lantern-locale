import { Worker } from 'worker_threads';
import { cpus } from 'os';
import { EventEmitter } from 'events';
import { join } from 'path';

interface Task {
  id: string;
  type: 'ast' | 'regex' | 'analysis';
  data: any;
  priority: number;
  timestamp: number;
}

interface WorkerInfo {
  worker: Worker;
  busy: boolean;
  taskCount: number;
  lastTaskTime: number;
  performance: {
    avgProcessingTime: number;
    successRate: number;
    memoryUsage: number;
  };
}

export class WorkerPool extends EventEmitter {
  private workers: Map<number, WorkerInfo> = new Map();
  private taskQueue: Task[] = [];
  private results: Map<string, any> = new Map();
  private maxWorkers: number;
  private workerScript: string;
  private activeTaskCount = 0;
  private metrics = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageProcessingTime: 0,
    peakMemoryUsage: 0
  };

  constructor(workerScript: string, maxWorkers = cpus().length - 1) {
    super();
    this.maxWorkers = maxWorkers;
    this.workerScript = workerScript;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    for (let i = 0; i < this.maxWorkers; i++) {
      await this.createWorker(i);
    }
  }

  private async createWorker(id: number): Promise<void> {
    const worker = new Worker(this.workerScript);
    
    const workerInfo: WorkerInfo = {
      worker,
      busy: false,
      taskCount: 0,
      lastTaskTime: 0,
      performance: {
        avgProcessingTime: 0,
        successRate: 1,
        memoryUsage: 0
      }
    };

    worker.on('message', (result) => {
      this.handleWorkerMessage(id, result);
    });

    worker.on('error', (error) => {
      this.handleWorkerError(id, error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        this.handleWorkerExit(id);
      }
    });

    this.workers.set(id, workerInfo);
  }

  private handleWorkerMessage(workerId: number, result: any): void {
    const workerInfo = this.workers.get(workerId)!;
    workerInfo.busy = false;
    workerInfo.taskCount++;
    
    const processingTime = Date.now() - workerInfo.lastTaskTime;
    workerInfo.performance.avgProcessingTime = 
      (workerInfo.performance.avgProcessingTime * (workerInfo.taskCount - 1) + processingTime) / workerInfo.taskCount;
    
    if (result.success) {
      workerInfo.performance.successRate = 
        (workerInfo.performance.successRate * (workerInfo.taskCount - 1) + 1) / workerInfo.taskCount;
    } else {
      workerInfo.performance.successRate = 
        (workerInfo.performance.successRate * (workerInfo.taskCount - 1)) / workerInfo.taskCount;
    }

    this.results.set(result.taskId, result);
    this.activeTaskCount--;
    this.metrics.completedTasks++;
    
    if (result.success) {
      this.emit('taskComplete', result);
    } else {
      this.metrics.failedTasks++;
      this.emit('taskError', result);
    }

    this.processNextTask();
  }

  private handleWorkerError(workerId: number, error: Error): void {
    console.error(`Worker ${workerId} error:`, error);
    this.handleWorkerExit(workerId);
  }

  private async handleWorkerExit(workerId: number): Promise<void> {
    const workerInfo = this.workers.get(workerId);
    if (workerInfo) {
      workerInfo.worker.terminate();
      this.workers.delete(workerId);
      await this.createWorker(workerId);
    }
  }

  private getBestWorker(): number | null {
    let bestWorker: number | null = null;
    let bestScore = -1;

    for (const [id, info] of this.workers.entries()) {
      if (info.busy) continue;

      // Calculate worker score based on performance metrics
      const score = 
        (1 / (info.performance.avgProcessingTime + 1)) * // Lower processing time is better
        info.performance.successRate * // Higher success rate is better
        (1 / (info.performance.memoryUsage + 1)); // Lower memory usage is better

      if (score > bestScore) {
        bestScore = score;
        bestWorker = id;
      }
    }

    return bestWorker;
  }

  private async processNextTask(): Promise<void> {
    if (this.taskQueue.length === 0) return;

    const workerId = this.getBestWorker();
    if (workerId === null) return;

    const workerInfo = this.workers.get(workerId)!;
    
    // Sort tasks by priority and timestamp
    this.taskQueue.sort((a, b) => 
      b.priority - a.priority || a.timestamp - b.timestamp
    );

    const task = this.taskQueue.shift()!;
    workerInfo.busy = true;
    workerInfo.lastTaskTime = Date.now();
    this.activeTaskCount++;

    try {
      workerInfo.worker.postMessage(task);
    } catch (error) {
      this.handleWorkerError(workerId, error as Error);
    }
  }

  async addTask(
    type: Task['type'],
    data: any,
    priority = 1
  ): Promise<string> {
    const task: Task = {
      id: crypto.randomUUID(),
      type,
      data,
      priority,
      timestamp: Date.now()
    };

    this.taskQueue.push(task);
    this.metrics.totalTasks++;
    
    this.processNextTask();
    return task.id;
  }

  async getResult(taskId: string, timeout = 30000): Promise<any> {
    if (this.results.has(taskId)) {
      const result = this.results.get(taskId);
      this.results.delete(taskId);
      return result;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Task ${taskId} timed out`));
      }, timeout);

      const handler = (result: any) => {
        if (result.taskId === taskId) {
          clearTimeout(timeoutId);
          this.removeListener('taskComplete', handler);
          this.removeListener('taskError', handler);
          resolve(result);
        }
      };

      this.on('taskComplete', handler);
      this.on('taskError', handler);
    });
  }

  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  async shutdown(): Promise<void> {
    await Promise.all(
      Array.from(this.workers.values()).map(info => 
        info.worker.terminate()
      )
    );
    
    this.workers.clear();
    this.taskQueue = [];
    this.results.clear();
  }
} 