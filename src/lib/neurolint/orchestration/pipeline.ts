
/**
 * Transformation Pipeline
 * Tracks and manages the transformation pipeline
 */

export class TransformationPipeline {
  private transformations: any[] = [];
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  addTransformation(name: string, result: any) {
    this.transformations.push({
      name,
      timestamp: new Date().toISOString(),
      ...result
    });
  }

  getReport() {
    return {
      filePath: this.filePath,
      transformationCount: this.transformations.length,
      transformations: this.transformations,
      totalChanges: this.transformations.reduce((sum, t) => sum + (t.changeCount || 0), 0)
    };
  }
}
