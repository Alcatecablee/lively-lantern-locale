import * as layer1 from "./layers/layer-1-config";
import * as layer2 from "./layers/layer-2-entities";
import * as layer3 from "./layers/layer-3-components";
import * as layer4 from "./layers/layer-4-hydration";
import { transformWithAST } from "./ast/orchestrator";
import {
  NeuroLintLayerResult,
  NeuroLintOptions,
  BackupSnapshot,
} from "./types";
import { CodeValidator } from "./validation/codeValidator";
import { BackupManager } from "./backup/backupManager";

const LAYER_LIST = [
  {
    id: 1,
    fn: layer1.transform,
    name: "Configuration Validation",
    description:
      "Optimizes TypeScript, Next.js config, and package.json with modern settings.",
    astSupported: false,
  },
  {
    id: 2,
    fn: layer2.transform,
    name: "Pattern & Entity Fixes",
    description:
      "Cleans up HTML entities, old patterns, and modernizes JS/TS code.",
    astSupported: false,
  },
  {
    id: 3,
    fn: layer3.transform,
    name: "Component Best Practices",
    description:
      "Solves missing key props, accessibility, prop types, and missing imports.",
    astSupported: true,
  },
  {
    id: 4,
    fn: layer4.transform,
    name: "Hydration & SSR Guard",
    description: "Fixes hydration bugs and adds SSR/localStorage protection.",
    astSupported: true,
  },
];

// Enhanced orchestrator with dry-run, backup system, and robust error handling
export async function NeuroLintOrchestrator(
  code: string,
  filePath?: string,
  useAST: boolean = true,
  layerIds: number[] = [1, 2, 3, 4],
  options: NeuroLintOptions = {},
): Promise<{
  transformed: string;
  layers: NeuroLintLayerResult[];
  layerOutputs: string[];
  backup?: BackupSnapshot;
  dryRun: boolean;
  executionStats: {
    totalTime: number;
    totalChanges: number;
    successfulLayers: number;
    failedLayers: number;
    revertedLayers: number;
  };
}> {
  const startTime = Date.now();
  const isDryRun = options.dryRun || false;
  let current = code;
  const results: NeuroLintLayerResult[] = [];
  const layerOutputs: string[] = [code];
  let backup: BackupSnapshot | undefined;
  let totalChanges = 0;
  let successfulLayers = 0;
  let failedLayers = 0;
  let revertedLayers = 0;

  // Create backup before any transformations
  if (!isDryRun) {
    backup = BackupManager.createBackup(code, filePath);
    if (options.verbose) {
      console.log(`🔄 Created backup: ${backup.id}`);
    }
  }

  // Validate initial code
  const initialValidation = CodeValidator.validate(code);
  if (!initialValidation.isValid && !options.allowInvalidInput) {
    return {
      transformed: code,
      layers: [
        {
          name: "Initial Validation",
          description: "Pre-transformation code validation",
          message: `Initial code is invalid: ${initialValidation.errors.join(", ")}`,
          code,
          success: false,
          executionTime: 0,
          changeCount: 0,
        },
      ],
      layerOutputs: [code],
      backup,
      dryRun: isDryRun,
      executionStats: {
        totalTime: Date.now() - startTime,
        totalChanges: 0,
        successfulLayers: 0,
        failedLayers: 1,
        revertedLayers: 0,
      },
    };
  }

  // Only run enabled layers (preserve execution order 1→2→3→4)
  const enabledLayers = LAYER_LIST.filter((l) => layerIds.includes(l.id));

  for (const layer of enabledLayers) {
    const layerStartTime = Date.now();
    const layerBackup = current; // Store state before this layer

    try {
      if (options.verbose) {
        console.log(`🔄 Executing Layer ${layer.id}: ${layer.name}`);
      }

      const previous = current;
      let next = current;
      let usedAST = false;
      let wasReverted = false;
      let transformError: string | undefined;

      // For AST-based layers, attempt AST transform if enabled
      if (layer.astSupported && useAST) {
        try {
          const astResult = await transformWithAST(
            current,
            `layer-${layer.id}-${layer.name.toLowerCase().replace(/\s/g, "-")}`,
          );
          next = astResult.code;
          usedAST = astResult.success;

          if (!astResult.success) {
            transformError = astResult.error;
            if (astResult.usedFallback === false) {
              // Hard AST failure, try non-AST transform
              if (options.verbose) {
                console.log(
                  `⚠️  AST transform failed for ${layer.name}, trying fallback`,
                );
              }
              next = await layer.fn(current, filePath);
            }
          }
        } catch (e) {
          transformError = `AST transform error: ${e instanceof Error ? e.message : String(e)}`;
          next = await layer.fn(current, filePath);
        }
      } else {
        try {
          next = await layer.fn(current, filePath);
        } catch (e) {
          transformError = `Transform error: ${e instanceof Error ? e.message : String(e)}`;
          throw e;
        }
      }

      // Enhanced validation with multiple checkpoints
      const validation = CodeValidator.compareBeforeAfter(previous, next);
      const syntaxValidation = CodeValidator.validate(next);

      if (validation.shouldRevert || !syntaxValidation.isValid) {
        const revertReason =
          validation.reason ||
          `Syntax errors: ${syntaxValidation.errors.join(", ")}`;
        console.warn(
          `🔙 Reverting ${layer.name} transformation: ${revertReason}`,
        );
        next = previous; // Revert to previous state
        wasReverted = true;
        revertedLayers++;
      }

      const executionTime = Date.now() - layerStartTime;
      const changeCount = calculateChanges(previous, next);
      const improvements = detectImprovements(
        previous,
        next,
        usedAST,
        layer.id,
      );

      if (wasReverted) {
        improvements.push("🛡️ Prevented code corruption");
      }

      if (!wasReverted && !isDryRun) {
        totalChanges += changeCount;
        successfulLayers++;
      }

      const result: NeuroLintLayerResult = {
        name: layer.name,
        description: layer.description,
        code: next,
        success: !wasReverted && !transformError,
        executionTime,
        changeCount,
        improvements,
        message: wasReverted
          ? `Transformation reverted: ${validation.reason || "Validation failed"}`
          : transformError || undefined,
        layerId: layer.id,
        usedAST,
        reverted: wasReverted,
        backup: layerBackup, // Store backup of state before this layer
      };

      results.push(result);

      // Only update current if not dry run
      if (!isDryRun) {
        current = next;
      }
      layerOutputs.push(next);

      if (options.verbose) {
        const status = wasReverted
          ? "❌ REVERTED"
          : transformError
            ? "⚠️  PARTIAL"
            : "✅ SUCCESS";
        console.log(
          `${status} Layer ${layer.id} (${executionTime}ms, ${changeCount} changes)`,
        );
      }
    } catch (e: any) {
      const executionTime = Date.now() - layerStartTime;
      failedLayers++;

      const errorResult: NeuroLintLayerResult = {
        name: layer.name,
        description: layer.description,
        message: `Fatal error: ${String(e)}`,
        code: current,
        success: false,
        executionTime,
        changeCount: 0,
        layerId: layer.id,
        usedAST: false,
        reverted: false,
        backup: layerBackup,
      };

      results.push(errorResult);
      layerOutputs.push(current);

      if (options.verbose) {
        console.error(`💥 FAILED Layer ${layer.id}: ${String(e)}`);
      }

      // On critical failure, we might want to stop or continue based on options
      if (options.failFast) {
        break;
      }
    }
  }

  const totalTime = Date.now() - startTime;

  if (options.verbose) {
    console.log(
      `🏁 Orchestration complete: ${totalTime}ms, ${totalChanges} total changes`,
    );
  }

  return {
    transformed: isDryRun ? code : current,
    layers: results,
    layerOutputs,
    backup,
    dryRun: isDryRun,
    executionStats: {
      totalTime,
      totalChanges,
      successfulLayers,
      failedLayers,
      revertedLayers,
    },
  };
}

function detectImprovements(
  before: string,
  after: string,
  usedAST: boolean = false,
  layerId?: number,
): string[] {
  const improvements: string[] = [];

  if (before === after) {
    improvements.push("No changes detected");
    return improvements;
  }

  // Generic improvements
  improvements.push("Code transformation applied");

  if (usedAST) {
    improvements.push("🧠 Used AST for reliable parsing");
  }

  // Layer-specific improvements detection
  switch (layerId) {
    case 1: // Config layer
      if (
        after.includes('"target": "ES2022"') &&
        !before.includes('"target": "ES2022"')
      ) {
        improvements.push("📊 Upgraded TypeScript target to ES2022");
      }
      if (
        after.includes("reactStrictMode: true") &&
        !before.includes("reactStrictMode: true")
      ) {
        improvements.push("⚛️ Enabled React Strict Mode");
      }
      break;

    case 2: // Pattern layer
      if (after.split("&amp;").length < before.split("&amp;").length) {
        improvements.push("🔧 Fixed HTML entities");
      }
      if (after.includes("const ") && !before.includes("const ")) {
        improvements.push("📦 Modernized variable declarations");
      }
      break;

    case 3: // Component layer
      if (after.split("key=").length > before.split("key=").length) {
        improvements.push("🔑 Added missing React keys");
      }
      if (after.split("aria-").length > before.split("aria-").length) {
        improvements.push("♿ Improved accessibility");
      }
      if (after.split("import ").length > before.split("import ").length) {
        improvements.push("📦 Added missing imports");
      }
      break;

    case 4: // Hydration layer
      if (after.includes("useEffect") && after.includes("window")) {
        improvements.push("💧 Added hydration guards");
      }
      if (
        after.includes("typeof window") &&
        !before.includes("typeof window")
      ) {
        improvements.push("🔒 Added SSR safety checks");
      }
      break;
  }

  return improvements;
}

function calculateChanges(before: string, after: string): number {
  if (before === after) return 0;

  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  let changes = 0;

  // Count line additions/deletions
  changes += Math.abs(beforeLines.length - afterLines.length);

  // Count line modifications
  const minLength = Math.min(beforeLines.length, afterLines.length);
  for (let i = 0; i < minLength; i++) {
    if (beforeLines[i] !== afterLines[i]) {
      changes++;
    }
  }

  return changes;
}

// Utility function for restoring from backup
export async function RestoreFromBackup(
  backupId: string,
): Promise<string | null> {
  return BackupManager.restoreBackup(backupId);
}

// Utility function for listing available backups
export function ListBackups(): BackupSnapshot[] {
  return BackupManager.listBackups();
}

// Expose the LAYER_LIST so TestRunner can provide names/descriptions
export { LAYER_LIST };
export type { NeuroLintLayerResult };
