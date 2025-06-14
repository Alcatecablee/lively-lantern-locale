export interface NeuroLintLayerResult {
  name: string;
  description?: string;
  message?: string;
  success: boolean;
  code: string;
  executionTime?: number;
  changeCount?: number;
  improvements?: string[];
  originalSize?: number;
  transformedSize?: number;
  error?: string;
  contractResults?: {
    preconditions: { passed: boolean; failedRules: string[] };
    postconditions: { passed: boolean; failedRules: string[] };
  };
  performanceImpact?: {
    sizeIncrease: number;
    complexityIncrease: number;
    impact: 'low' | 'medium' | 'high';
  };
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
