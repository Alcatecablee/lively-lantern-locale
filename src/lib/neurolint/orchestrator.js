// orchestrator.js
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { createInterface } from 'readline';

export interface ASTTransformResult {
  success: boolean;
  code: string;
  error?: string;
  usedFallback?: boolean;
}

export interface LayerOutput {
  id: number;
  name: string;
  success: boolean;
  code: string;
  executionTime: number;
  changeCount?: number;
  improvements?: string[];
  error?: string;
  errorCategory?: string;
  suggestion?: string;
  recoveryOptions?: string[];
  revertReason?: string;
  layerId?: number;
  reverted?: boolean;
  description?: string;
  message?: string;
}

export interface NeuroLintLayerResult extends LayerOutput {}

export interface TransformationResult {
  success: boolean;
  transformed: string;
  layers: LayerOutput[];
  executionTime: number;
  error?: string;
  executionStats?: any;
  diagnostics?: any;
  layerOutputs?: string[];
  backup?: string;
}

export const LAYER_LIST = [
  { id: 1, name: 'Configuration', description: 'Foundation setup and TypeScript/Next.js config optimization' },
  { id: 2, name: 'Entity Cleanup', description: 'HTML entities and pattern modernization' },
  { id: 3, name: 'Components', description: 'React component fixes and best practices' },
  { id: 4, name: 'Hydration', description: 'SSR safety and hydration issue resolution' },
  { id: 5, name: 'Next.js', description: 'App Router and Next.js specific optimizations' },
  { id: 6, name: 'Testing', description: 'Testing patterns and validation improvements' }
];

class TransformationValidator {
  static validateTransformation(before: string, after: string): { shouldRevert: boolean; reason?: string } {
    if (before === after) return { shouldRevert: false, reason: 'No changes made' };
    
    try {
      // Simple syntax check using eval (replace with Babel if needed)
      new Function(after);
    } catch (e) {
      return { shouldRevert: true, reason: `Syntax error: ${e.message}` };
    }

    if (/import\s*{\s*\n\s*import/.test(after) && !/import\s*{\s*\n\s*import/.test(before)) {
      return { shouldRevert: true, reason: 'Corrupted import statements detected' };
    }

    return { shouldRevert: false };
  }
}

class LayerDependencyManager {
  static readonly DEPENDENCIES = {
    1: [], 2: [1], 3: [1, 2], 4: [1, 2, 3], 5: [1, 2, 3, 4], 6: [1, 2, 3, 4, 5]
  };

  static validateAndCorrectLayers(requestedLayers: number[]): { correctedLayers: number[]; warnings: string[] } {
    let correctedLayers = [...new Set(requestedLayers)].sort((a, b) => a - b);
    const warnings = [];

    for (const layerId of requestedLayers) {
      const deps = this.DEPENDENCIES[layerId] || [];
      const missing = deps.filter(dep => !correctedLayers.includes(dep));
      if (missing.length > 0) {
        correctedLayers.push(...missing);
        warnings.push(`Layer ${layerId} requires ${missing.join(', ')}. Auto-added.`);
      }
    }

    return { correctedLayers: [...new Set(correctedLayers)].sort((a, b) => a - b), warnings };
  }
}

class TransformationPipeline {
  private states: { step: number; layerId: number | null; code: string; timestamp: number; description: string }[] = [];
  private metadata: { layerId: number; success: boolean; executionTime: number; changeCount: number }[] = [];

  constructor(private initialCode: string) {
    this.states.push({ step: 0, layerId: null, code: initialCode, timestamp: Date.now(), description: 'Initial state' });
  }

  recordState(state: { step: number; layerId: number; code: string; timestamp: number; description: string; success: boolean; executionTime: number; changeCount?: number }) {
    this.states.push(state);
    if (state.layerId) {
      this.metadata.push({ layerId: state.layerId, success: state.success, executionTime: state.executionTime, changeCount: state.changeCount || 0 });
    }
  }

  rollbackTo(step: number): string {
    const state = this.states[step];
    if (!state) throw new Error(`Invalid step: ${step}`);
    return state.code;
  }
}

export async function NeuroLintOrchestrator(
  code: string,
  filePath?: string,
  dryRun: boolean = false,
  selectedLayers: number[] = [],
  verbose: boolean = false
): Promise<TransformationResult> {
  const startTime = performance.now();
  const targetDir = filePath ? dirname(filePath) : process.cwd();
  const pipeline = new TransformationPipeline(code);
  let transformedCode = code;
  let backupCode = code;
  const layerOutputs: LayerOutput[] = [];

  try {
    // Validate and correct layers
    const { correctedLayers, warnings } = LayerDependencyManager.validateAndCorrectLayers(selectedLayers.length ? selectedLayers : LAYER_LIST.map(l => l.id));
    if (verbose && warnings.length) log(`Warnings: ${warnings.join(', ')}`, 'warning');

    // Ensure scripts directory
    const scriptsDir = join(targetDir, 'scripts');
    if (!existsSync(scriptsDir)) mkdirSync(scriptsDir, { recursive: true });

    // Confirmation
    if (!dryRun && process.stdin.isTTY) {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise(resolve => rl.question('Proceed with automated fixes? (y/N): ', resolve));
      rl.close();
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        return { success: false, transformed: code, layers: [], executionTime: performance.now() - startTime, error: 'Cancelled by user' };
      }
    }

    // Execute layers
    const layers = LAYER_LIST.map(l => ({ ...l, script: `fix-layer-${l.id}-${l.name.replace(/ /g, '-').toLowerCase()}.js` }));
    let successfulLayers = 0;

    for (const layer of layers) {
      if (!correctedLayers.includes(layer.id)) {
        layerOutputs.push({ id: layer.id, name: layer.name, success: true, code: transformedCode, executionTime: 0, description: layer.description, message: 'Skipped' });
        continue;
      }

      const layerStartTime = performance.now();
      log(`Layer ${layer.id}: ${layer.description}`, 'info');
      log('='.repeat(50), 'info');

      const scriptPath = join(scriptsDir, layer.script);
      if (!existsSync(scriptPath)) {
        layerOutputs.push({
          id: layer.id, name: layer.name, success: false, code: transformedCode, executionTime: 0,
          error: `Script not found: ${scriptPath}`, description: layer.description
        });
        continue;
      }

      const previousCode = transformedCode;
      const result = runCommand(`node "${scriptPath}"`, `Layer ${layer.id} fixes`);
      const executionTime = performance.now() - layerStartTime;

      if (result !== null) {
        const newCode = result.toString();
        const validation = TransformationValidator.validateTransformation(previousCode, newCode);
        if (validation.shouldRevert) {
          layerOutputs.push({
            id: layer.id, name: layer.name, success: false, code: previousCode, executionTime,
            revertReason: validation.reason, reverted: true, description: layer.description
          });
          transformedCode = previousCode;
        } else {
          transformedCode = newCode;
          layerOutputs.push({
            id: layer.id, name: layer.name, success: true, code: transformedCode, executionTime,
            changeCount: 1, description: layer.description
          });
          successfulLayers++;
          pipeline.recordState({
            step: layerOutputs.length, layerId: layer.id, code: transformedCode, timestamp: Date.now(),
            description: `After Layer ${layer.id}`, success: true, executionTime, changeCount: 1
          });
        }
      } else {
        layerOutputs.push({
          id: layer.id, name: layer.name, success: false, code: previousCode, executionTime,
          error: 'Execution failed', description: layer.description, recoveryOptions: ['Retry', 'Skip', 'Revert']
        });
        transformedCode = previousCode;
        pipeline.recordState({
          step: layerOutputs.length, layerId: layer.id, code: previousCode, timestamp: Date.now(),
          description: `Layer ${layer.id} failed`, success: false, executionTime
        });
      }
    }

    // Final validation
    log('Running final validation...', 'info');
    const buildResult = runCommand('npm run build', 'Final build validation');
    const validationSuccess = buildResult !== null;

    const totalExecutionTime = performance.now() - startTime;
    return {
      success: successfulLayers > 0 && validationSuccess,
      transformed: transformedCode,
      layers: layerOutputs,
      executionTime: totalExecutionTime,
      executionStats: {
        totalLayers: layers.length,
        successfulLayers,
        failedLayers: layers.length - successfulLayers,
        totalExecutionTime
      },
      backup: backupCode,
      diagnostics: validationSuccess ? undefined : 'Build validation failed'
    };

  } catch (error) {
    log('Orchestration failed:', 'error');
    log(error instanceof Error ? error.message : 'Unknown error', 'error');
    return {
      success: false,
      transformed: code,
      layers: layerOutputs,
      executionTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown orchestration error',
      backup: backupCode
    };
  }
}

function log(message, level = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = { 'info': '[INFO]', 'success': '[SUCCESS]', 'warning': '[WARNING]', 'error': '[ERROR]', 'debug': '[DEBUG]' }[level] || '[INFO]';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function runCommand(command, description) {
  try {
    log(`Running: ${description}`, 'info');
    return execSync(command, { cwd: config.targetDir, encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    log(`Failed: ${description} - ${error.message}`, 'error');
    return null;
  }
}
