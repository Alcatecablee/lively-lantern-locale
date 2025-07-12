
/**
 * Performance Optimizer
 * Optimizes transformation performance and caching
 */

export class PerformanceOptimizer {
  private static cache = new Map<string, string>();

  static shouldSkipLayer(code: string, layerId: number): boolean {
    const cacheKey = `${layerId}-${this.hashCode(code)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) === code;
    }

    return false;
  }

  static cacheResult(code: string, layerId: number, result: string) {
    const cacheKey = `${layerId}-${this.hashCode(code)}`;
    this.cache.set(cacheKey, result);
  }

  private static hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
}
