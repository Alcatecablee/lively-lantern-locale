
// TransformationPipeline - Track pipeline state for debugging and rollback
class TransformationPipeline {
  constructor(filePath) {
    this.filePath = filePath;
    this.transformations = [];
    this.startTime = Date.now();
    this.snapshots = [];
  }

  addTransformation(layerName, result) {
    this.transformations.push({
      layer: layerName,
      timestamp: Date.now(),
      success: result.success,
      changes: result.changes,
      executionTime: result.executionTime,
      improvements: result.improvements || [],
      error: result.error
    });

    // Store content snapshot for rollback
    if (result.success) {
      this.snapshots.push({
        layer: layerName,
        content: result.content,
        timestamp: Date.now()
      });
    }
  }

  getTotalTime() {
    return Date.now() - this.startTime;
  }

  getSuccessfulLayers() {
    return this.transformations.filter(t => t.success).length;
  }

  getFailedLayers() {
    return this.transformations.filter(t => !t.success);
  }

  // Rollback to specific layer
  rollbackToLayer(layerName) {
    const snapshot = this.snapshots.find(s => s.layer === layerName);
    return snapshot ? snapshot.content : null;
  }

  // Get execution report
  getReport() {
    return {
      filePath: this.filePath,
      totalTime: this.getTotalTime(),
      successfulLayers: this.getSuccessfulLayers(),
      failedLayers: this.getFailedLayers().length,
      transformations: this.transformations
    };
  }
}

module.exports = TransformationPipeline;
