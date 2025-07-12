
// PerformanceOptimizer - Caching and optimization
class PerformanceOptimizer {
  static cache = new Map();
  static skipCache = new Set();

  // Cache transformation results
  static cacheResult(fileHash, layerId, result) {
    const key = `${fileHash}-${layerId}`;
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  // Get cached result if available and fresh
  static getCachedResult(fileHash, layerId, maxAge = 300000) { // 5 minutes
    const key = `${fileHash}-${layerId}`;
    const cached = this.cache.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < maxAge) {
      return cached.result;
    }

    return null;
  }

  // Generate simple hash for content
  static hashContent(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Determine if layer should be skipped based on content analysis
  static shouldSkipLayer(content, layerId) {
    // Skip if already marked to skip
    if (this.skipCache.has(`${this.hashContent(content)}-${layerId}`)) {
      return true;
    }

    // Layer-specific skip conditions
    switch (layerId) {
      case 1: // Config layer
        return !content.includes('tsconfig') && !content.includes('next.config');
      case 2: // Patterns layer
        return !content.includes('&quot;') && !content.includes('&amp;');
      case 3: // Components layer
        return !content.includes('.map(') && !content.includes('<');
      case 4: // Hydration layer
        return !content.includes('localStorage') && !content.includes('window');
      case 5: // Next.js layer
        return !content.includes('useState') && !content.includes('useEffect');
      case 6: // Testing layer
        return !content.includes('test') && !content.includes('describe');
      default:
        return false;
    }
  }

  // Mark layer as skippable for future runs
  static markSkippable(content, layerId) {
    this.skipCache.add(`${this.hashContent(content)}-${layerId}`);
  }

  // Clear caches
  static clearCache() {
    this.cache.clear();
    this.skipCache.clear();
  }
}

module.exports = PerformanceOptimizer;
