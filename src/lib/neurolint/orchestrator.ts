import * as layer1 from "./layers/layer-1-config";
import * as layer2 from "./layers/layer-2-entities";
import * as layer3 from "./layers/layer-3-components";
import * as layer4 from "./layers/layer-4-hydration";
import * as layer5 from "./layers/layer-5-nextjs";
import * as layer6 from "./layers/layer-6-testing";
import { NeuroLintLayerResult } from "./types";

// Compose pipeline of all 6 layers
const layers = [
  {
    fn: layer1.transform,
    name: "Configuration Validation",
    description: "Ensures config and trailingSlash.",
  },
  {
    fn: layer2.transform,
    name: "HTML Entity Cleanup",
    description: "Replaces unsafe HTML entities with proper equivalents.",
  },
  {
    fn: layer3.transform,
    name: "Component Codemods",
    description: "Wraps error-prone components and adds prop types.",
  },
  {
    fn: layer4.transform,
    name: "Hydration Directives",
    description: "Adds 'use client' to React files with JSX.",
  },
  {
    fn: layer5.transform,
    name: "Import Cleanup",
    description: "Cleans import duplicates and upgrades legacy usage.",
  },
  {
    fn: layer6.transform,
    name: "Testing Fixtures",
    description: "Generates tests and applies error boundaries.",
  },
];

export async function NeuroLintOrchestrator(code: string): Promise<{
  transformed: string;
  layers: NeuroLintLayerResult[];
}> {
  let current = code;
  const results: NeuroLintLayerResult[] = [];
  for (const layer of layers) {
    try {
      const next = await layer.fn(current);
      results.push({
        name: layer.name,
        description: layer.description,
        code: next,
        success: true,
      });
      current = next;
    } catch (e: any) {
      results.push({
        name: layer.name,
        description: layer.description,
        message: String(e),
        code: current,
        success: false,
      });
      // Keep returning existing code if failed, continue
    }
  }
  return { transformed: current, layers: results };
}

export type { NeuroLintLayerResult };
