
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

interface WebVitalsData {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
}

// Extend PerformanceEntry for First Input Delay
interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

export class PerformanceMonitor {;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeWebVitals();
  }

  private initializeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Monitor First Contentful Paint
    this.observeEntryType('paint', (entries) => {
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('FCP', entry.startTime);
        }
      });
    });

    // Monitor Largest Contentful Paint
    this.observeEntryType('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.recordMetric('LCP', lastEntry.startTime);
      }
    });

    // Monitor First Input Delay
    this.observeEntryType('first-input', (entries) => {
      entries.forEach((entry) => {
        const fidEntry = entry as FirstInputEntry;
        this.recordMetric('FID', fidEntry.processingStart - fidEntry.startTime);
      });
    });

    // Monitor Layout Shifts
    this.observeEntryType('layout-shift', (entries) => {
      let cumulativeScore = 0;
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          cumulativeScore += entry.value;
        }
      });
      if (cumulativeScore > 0) {
        this.recordMetric('CLS', cumulativeScore);
      }
    });
  }

  private observeEntryType(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  recordMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    console.debug(`Performance metric - ${name}: ${value.toFixed(2)}ms`);

    // Report to analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window // @ts-ignore
).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: Math.round(value),
        custom_parameter: 'web_vitals'
      });
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getWebVitals(): WebVitalsData {
    const vitals: WebVitalsData = {};

    this.metrics.forEach(metric => {
      switch (metric.name) {
        case 'FCP':
          vitals.fcp = metric.value;
          break;
        case 'LCP':
          vitals.lcp = metric.value;
          break;
        case 'FID':
          vitals.fid = metric.value;
          break;
        case 'CLS':
          vitals.cls = metric.value;
          break;
      }
    });

    return vitals;
  }

  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    this.recordMetric(name, duration);
    return result;
  }

  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    this.recordMetric(name, duration);
    return result;
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();