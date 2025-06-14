
export interface NeuroLintLayerResult {
  name: string;
  description?: string;
  message?: string;
  success: boolean;
  code: string;
  executionTime?: number;
  changeCount?: number;
  improvements?: string[];
}

export interface NeuroLintOptions {
  dryRun?: boolean;
  verbose?: boolean;
  skipLayers?: number[];
  targetFiles?: string[];
}

export interface NeuroLintStats {
  totalFiles: number;
  totalChanges: number;
  totalTime: number;
  successfulLayers: number;
  failedLayers: number;
  improvements: string[];
}
