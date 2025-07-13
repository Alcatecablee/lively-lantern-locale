export interface NeuroLintLayerResult {
  name: string;
  description?: string;
  message?: string;
  success: boolean;
  code: string;
  executionTime?: number;
  changeCount?: number;
  improvements?: string[];
  layerId?: number;
  usedAST?: boolean;
  reverted?: boolean;
  backup?: string; // Backup of code state before this layer
}

export interface NeuroLintOptions {
  dryRun?: boolean;
  verbose?: boolean;
  skipLayers?: number[];
  targetFiles?: string[];
  allowInvalidInput?: boolean; // defaults to true - allow processing corrupted code to fix it
  failFast?: boolean;
  createBackups?: boolean;
  maxRetries?: number;
}

export interface NeuroLintStats {
  totalFiles: number;
  totalChanges: number;
  totalTime: number;
  successfulLayers: number;
  failedLayers: number;
  revertedLayers: number;
  improvements: string[];
}

export interface BackupSnapshot {
  id: string;
  timestamp: Date;
  originalCode: string;
  filePath?: string;
  metadata: {
    codeLength: number;
    lineCount: number;
    layers: number[];
  };
}

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  corruptionDetected: boolean;
  complexity: {
    cyclomaticComplexity: number;
    linesOfCode: number;
    functionCount: number;
  };
}

export interface LayerDiagnostics {
  layerId: number;
  layerName: string;
  preValidation: ValidationReport;
  postValidation: ValidationReport;
  transformationTime: number;
  success: boolean;
  changesApplied: number;
  recommendations: string[];
}
