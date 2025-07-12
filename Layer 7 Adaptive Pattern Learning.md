**Layer 7: Adaptive Pattern Learning**

introducing a **Layer 7: Adaptive Pattern Learning**. This layer will analyze transformations from all previous layers (1–6), extract recurring fix patterns, store them, and apply them to new code. Below, I’ll outline how to integrate this new layer into the existing `NeuroLintOrchestrator` while respecting the current layer structure and dependencies. I’ll also address how to implement the pattern learning mechanism, leveraging the provided code and the patterns from the original document.

---

## Overview of Layer 7: Adaptive Pattern Learning

**Purpose**: Layer 7 will dynamically learn fix patterns by analyzing the `before` and `after` states of code transformations from Layers 1–6. It will:
- Extract common transformation patterns (e.g., regex replacements, AST changes).
- Store learned rules in a persistent store (e.g., JSON file).
- Apply learned rules to new code, prioritizing high-confidence patterns.
- Validate learned transformations to prevent errors.
- Provide a feedback loop to refine rules based on validation results and user input.

**Key Features**:
- **Pattern Extraction**: Identify recurring changes (e.g., adding `'use client'`, fixing imports, adding `React.memo`).
- **Rule Persistence**: Save rules to a file for reuse across sessions.
- **Safe Application**: Validate learned transformations using `TransformationValidator`.
- **Integration**: Seamlessly fit into the existing orchestration pipeline with dependency management.

---

## Implementation Steps

### 1. Update Layer Configurations
Add Layer 7 to the `LAYER_CONFIGS` in `constants.ts`:

```typescript
// constants.ts
export const LAYER_CONFIGS = {
  1: { id: 1, name: 'Configuration', supportsAST: false },
  2: { id: 2, name: 'Entity Cleanup', supportsAST: false },
  3: { id: 3, name: 'Components', supportsAST: true },
  4: { id: 4, name: 'Hydration', supportsAST: true },
  5: { id: 5, name: 'Next.js App Router Fixes', supportsAST: true },
  6: { id: 6, name: 'Testing and Validation', supportsAST: true },
  7: { id: 7, name: 'Adaptive Pattern Learning', supportsAST: false } // New layer
};
```

Update `LayerDependencyManager` to include Layer 7’s dependencies (all previous layers):

```typescript
// dependency-manager.ts
private static readonly DEPENDENCIES = {
  1: [], // Configuration
  2: [1], // Entity Cleanup
  3: [1, 2], // Components
  4: [1, 2, 3], // Hydration
  5: [1, 2, 3, 4], // Next.js App Router Fixes
  6: [1, 2, 3, 4, 5], // Testing and Validation
  7: [1, 2, 3, 4, 5, 6] // Adaptive Pattern Learning depends on all
};
```

Update the `LAYER_INFO` to include Layer 7:

```typescript
private static readonly LAYER_INFO = {
  1: { name: 'Configuration', critical: true },
  2: { name: 'Entity Cleanup', critical: false },
  3: { name: 'Components', critical: false },
  4: { name: 'Hydration', critical: false },
  5: { name: 'Next.js App Router Fixes', critical: false },
  6: { name: 'Testing and Validation', critical: false },
  7: { name: 'Adaptive Pattern Learning', critical: false }
};
```

### 2. Implement the Pattern Learning Layer
Create a `PatternLearner` class to handle learning, storing, and applying fix patterns. This implementation will focus on simple regex-based patterns initially, with the potential to extend to AST-based patterns later.

```typescript
// pattern-learner.ts
import { logger } from './logger';
import { metrics } from './metrics';
import fs from 'fs/promises';

interface LearnedRule {
  pattern: RegExp | string; // Regex for now, extend to AST nodes later
  replacement: string | ((match: string) => string); // Static or dynamic replacement
  confidence: number; // 0–1, based on frequency and success
  frequency: number; // Number of times observed
  sourceLayer: number; // Layer that generated this pattern
  createdAt: number; // Timestamp
  description: string; // Human-readable description
}

interface PatternLearningResult {
  appliedRules: string[];
  transformedCode: string;
  ruleCount: number;
}

export class PatternLearner {
  private static readonly RULE_STORAGE_PATH = './learned-rules.json';
  private static readonly MIN_CONFIDENCE = 0.7;
  private rules: LearnedRule[] = [];

  constructor() {
    this.loadRules();
  }

  /**
   * Load rules from persistent storage
   */
  private async loadRules(): Promise<void> {
    try {
      const data = await fs.readFile(PatternLearner.RULE_STORAGE_PATH, 'utf-8');
      this.rules = JSON.parse(data, (key, value) => {
        if (key === 'pattern' && typeof value === 'string' && value.startsWith('/')) {
          const [, pattern, flags] = value.match(/^\/(.*)\/([a-z]*)$/) || [];
          return new RegExp(pattern, flags);
        }
        return value;
      });
      logger.info('Loaded learned rules', { ruleCount: this.rules.length });
    } catch (error) {
      logger.warn('No existing rules found, starting fresh', { error });
    }
  }

  /**
   * Save rules to persistent storage
   */
  private async saveRules(): Promise<void> {
    try {
      const serialized = JSON.stringify(this.rules, (key, value) => {
        if (key === 'pattern' && value instanceof RegExp) {
          return value.toString();
        }
        return value;
      });
      await fs.writeFile(PatternLearner.RULE_STORAGE_PATH, serialized);
      logger.info('Saved learned rules', { ruleCount: this.rules.length });
    } catch (error) {
      logger.error('Failed to save learned rules', { error });
    }
  }

  /**
   * Learn patterns from a transformation
   */
  public async learnFromTransformation(
    before: string,
    after: string,
    sourceLayer: number
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const patterns = this.extractPatterns(before, after, sourceLayer);
      for (const pattern of patterns) {
        const existingRule = this.rules.find(
          r => r.pattern.toString() === pattern.pattern.toString()
        );
        if (existingRule) {
          existingRule.frequency++;
          existingRule.confidence = Math.min(1, existingRule.confidence + 0.05);
        } else {
          this.rules.push(pattern);
        }
      }
      await this.saveRules();
      metrics.recordPatternLearning(patterns.length, Date.now() - startTime);
      logger.info('Learned new patterns', {
        patternCount: patterns.length,
        sourceLayer
      });
    } catch (error) {
      logger.error('Pattern learning failed', { error, sourceLayer });
      metrics.recordError('pattern_learning_failure');
    }
  }

  /**
   * Extract patterns from before/after states
   */
  private extractPatterns(before: string, after: string, sourceLayer: number): LearnedRule[] {
    const patterns: LearnedRule[] = [];
    const diffLines = this.getDiffLines(before, after);

    for (const { beforeLine, afterLine } of diffLines) {
      if (beforeLine && afterLine && beforeLine !== afterLine) {
        const pattern = this.createPattern(beforeLine, afterLine, sourceLayer);
        if (pattern) {
          patterns.push(pattern);
        }
      }
    }

    return patterns;
  }

  /**
   * Create a pattern based on layer-specific transformations
   */
  private createPattern(beforeLine: string, afterLine: string, sourceLayer: number): LearnedRule | null {
    let pattern: RegExp | null = null;
    let replacement: string | ((match: string) => string) = afterLine;
    let description = '';

    switch (sourceLayer) {
      case 5: // Next.js App Router Fixes
        if (beforeLine.includes('import') && afterLine.includes("'use client'")) {
          pattern = /^((?:import\s.*?\n)+)/;
          replacement = "'use client';\n$1";
          description = "Add 'use client' directive at top of file";
        } else if (beforeLine.includes('import') && afterLine.includes('React')) {
          pattern = new RegExp(`^import\\s+{[^}]*}\\s+from\\s+['"]react['"](?!.*React)`, 'm');
          replacement = match => `${match}, { React }`;
          description = 'Optimize React imports';
        }
        break;
      case 6: // Testing and Validation
        if (beforeLine.includes('function') && afterLine.includes('React.memo')) {
          pattern = /(function\s+\w+\s*\([^)]*\)\s*{[^}]*})/;
          replacement = match => `React.memo(${match})`;
          description = 'Add React.memo to functional component';
        } else if (beforeLine.includes('<') && afterLine.includes('aria-')) {
          pattern = /<(\w+)([^>]*?)>/;
          replacement = match => match.replace('>', ' aria-label="accessible-element">');
          description = 'Add accessibility attributes';
        }
        break;
      default:
        // Generic pattern for simple replacements
        pattern = new RegExp(beforeLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        description = `Generic replacement from Layer ${sourceLayer}`;
    }

    if (!pattern) return null;

    return {
      pattern,
      replacement,
      confidence: 0.7,
      frequency: 1,
      sourceLayer,
      createdAt: Date.now(),
      description
    };
  }

  /**
   * Simple diff to identify changed lines
   */
  private getDiffLines(before: string, after: string): { beforeLine?: string; afterLine?: string }[] {
    const beforeLines = before.split('\n');
    const afterLines = after.split('\n');
    const maxLength = Math.max(beforeLines.length, afterLines.length);
    const diff: { beforeLine?: string; afterLine?: string }[] = [];

    for (let i = 0; i < maxLength; i++) {
      const beforeLine = beforeLines[i];
      const afterLine = afterLines[i];
      if (beforeLine !== afterLine) {
        diff.push({ beforeLine, afterLine });
      }
    }

    return diff;
  }

  /**
   * Apply learned rules to code
   */
  public async applyLearnedRules(code: string): Promise<PatternLearningResult> {
    let transformedCode = code;
    const appliedRules: string[] = [];
    const startTime = Date.now();

    for (const rule of this.rules.filter(r => r.confidence >= PatternLearner.MIN_CONFIDENCE)) {
      try {
        if (rule.pattern instanceof RegExp) {
          if (typeof rule.replacement === 'string') {
            transformedCode = transformedCode.replace(rule.pattern, rule.replacement);
            appliedRules.push(rule.description);
          } else if (typeof rule.replacement === 'function') {
            transformedCode = transformedCode.replace(rule.pattern, rule.replacement);
            appliedRules.push(rule.description);
          }
        }
        logger.debug('Applied learned rule', { rule: rule.description });
      } catch (error) {
        logger.warn('Failed to apply learned rule', { error, rule: rule.description });
        metrics.recordError('rule_application_failure');
      }
    }

    metrics.recordPatternApplication(appliedRules.length, Date.now() - startTime);

    return {
      appliedRules,
      transformedCode,
      ruleCount: appliedRules.length
    };
  }
}
```

### 3. Update NeuroLintOrchestrator
Modify `NeuroLintOrchestrator` to:
- Initialize the `PatternLearner`.
- Learn from successful transformations in Layers 1–6.
- Implement Layer 7 in the `executeLayer` method.
- Update validation and metrics to handle learned rules.

Here’s the updated `NeuroLintOrchestrator` with changes integrated:

```typescript
import { LayerExecutionResult, ExecutionOptions, LayerResult } from './types';
import { TransformationValidator } from './validation';
import { LayerDependencyManager } from './dependency-manager';
import { SmartLayerSelector } from './smart-selector';
import { TransformationPipeline } from './pipeline';
import { ErrorRecoverySystem } from './error-recovery';
import { PatternLearner } from './pattern-learner'; // NEW
import { LAYER_CONFIGS } from './constants';
import { logger } from './logger';
import { metrics } from './metrics';

/**
 * Enterprise-grade NeuroLint orchestration system
 * Provides robust, scalable, and observable code transformation
 */
export class NeuroLintOrchestrator {
  private static readonly MAX_RETRIES = 3;
  private static readonly TIMEOUT_MS = 30000;
  private static readonly patternLearner = new PatternLearner(); // NEW: Initialize learner

  static async transform(
    code: string,
    requestedLayers?: number[],
    options: ExecutionOptions = {}
  ): Promise<LayerExecutionResult> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    logger.info('Starting NeuroLint transformation', {
      executionId,
      operation: 'transform',
      metadata: {
        codeLength: code.length,
        requestedLayers,
        options
      }
    });

    try {
      // Input validation
      this.validateInput(code, requestedLayers, options);

      // Create execution context with timeout
      const result = await Promise.race([
        this.executeTransformationWithRetry(code, requestedLayers, options, executionId),
        this.createTimeoutPromise()
      ]);

      const duration = Date.now() - startTime;

      // Record metrics
      metrics.recordPipelineExecution(
        result.results.map(r => r.layerId),
        duration,
        result.successfulLayers,
        result.results.reduce((sum, r) => sum + r.changeCount, 0)
      );

      logger.performance('Transformation completed', duration, {
        executionId,
        metadata: {
          successfulLayers: result.successfulLayers,
          totalLayers: result.results.length
        }
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('Transformation failed', error as Error, {
        executionId,
        metadata: { duration }
      });

      metrics.recordError('transformation_failure');

      return {
        finalCode: code,
        results: [],
        states: [code],
        totalExecutionTime: duration,
        successfulLayers: 0
      };
    }
  }

  static analyze(code: string, filePath?: string) {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    logger.info('Starting code analysis', {
      executionId,
      operation: 'analyze',
      metadata: {
        codeLength: code.length,
        filePath
      }
    });

    try {
      const result = SmartLayerSelector.analyzeAndRecommend(code, filePath);

      logger.performance('Analysis completed', Date.now() - startTime, {
        executionId,
        metadata: {
          issuesFound: result.detectedIssues.length,
          recommendedLayers: result.recommendedLayers.length
        }
      });

      return result;

    } catch (error) {
      logger.error('Analysis failed', error as Error, { executionId });
      metrics.recordError('analysis_failure');
      throw error;
    }
  }

  private static async executeTransformationWithRetry(
    code: string,
    requestedLayers: number[] | undefined,
    options: ExecutionOptions,
    executionId: string
  ): Promise<LayerExecutionResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        logger.debug(`Transformation attempt ${attempt}`, {
          executionId,
          metadata: { attempt, maxRetries: this.MAX_RETRIES }
        });

        return await this.executeLayers(code, requestedLayers, options, executionId);

      } catch (error) {
        lastError = error as Error;

        logger.warn(`Transformation attempt ${attempt} failed`, {
          executionId,
          metadata: {
            attempt,
            error: lastError.message,
            willRetry: attempt < this.MAX_RETRIES
          }
        });

        if (attempt < this.MAX_RETRIES) {
          await this.delay(Math.pow(2, attempt - 1) * 1000);
        }
      }
    }

    throw lastError || new Error('All transformation attempts failed');
  }

  private static async executeLayers(
    code: string,
    requestedLayers: number[] | undefined,
    options: ExecutionOptions,
    executionId: string
  ): Promise<LayerExecutionResult> {
    // Determine layers to execute
    const layers = this.determineLayers(code, requestedLayers);

    // Validate and correct dependencies
    const { correctedLayers, warnings } = LayerDependencyManager.validateAndCorrectLayers(layers);

    // Log warnings
    warnings.forEach(warning => {
      logger.warn('Layer dependency warning', {
        executionId,
        metadata: { warning }
      });
    });

    let current = code;
    const results: LayerResult[] = [];
    const states: string[] = [code];

    for (const layerId of correctedLayers) {
      const layerTimer = metrics.startTimer('layer_execution');
      const previous = current;

      logger.debug(`Executing layer ${layerId}`, {
        executionId,
        layerId,
        operation: 'layer_execution'
      });

      try {
        // Execute layer with timeout
        const transformed = await Promise.race([
          this.executeLayer(layerId, current, options),
          this.createLayerTimeoutPromise(layerId)
        ]);

        // Validate transformation
        const validation = TransformationValidator.validateTransformation(previous, transformed);
        const layerDuration = metrics.endTimer(layerTimer);

        if (validation.shouldRevert) {
          logger.warn(`Reverting layer ${layerId}`, {
            executionId,
            layerId,
            metadata: { reason: validation.reason }
          });

          current = previous;
          const result: LayerResult = {
            layerId,
            success: false,
            code: previous,
            executionTime: layerDuration,
            changeCount: 0,
            revertReason: validation.reason
          };

          results.push(result);
          metrics.recordLayerExecution(layerId, false, layerDuration, 0);

        } else {
          current = transformed;
          states.push(current);

          const changeCount = this.calculateChanges(previous, transformed);
          const improvements = this.detectImprovements(previous, transformed);

          const result: LayerResult = {
            layerId,
            success: true,
            code: current,
            executionTime: layerDuration,
            changeCount,
            improvements
          };

          results.push(result);
          metrics.recordLayerExecution(layerId, true, layerDuration, changeCount);

          // NEW: Learn from successful transformations (Layers 1–6)
          if (layerId !== 7 && previous !== transformed) {
            await this.patternLearner.learnFromTransformation(previous, transformed, layerId);
          }

          logger.info(`Layer ${layerId} completed successfully`, {
            executionId,
            layerId,
            metadata: {
              changeCount,
              improvements: improvements.length,
              duration: layerDuration
            }
          });
        }

      } catch (error) {
        const layerDuration = metrics.endTimer(layerTimer);

        logger.error(`Layer ${layerId} failed`, error as Error, {
          executionId,
          layerId
        });

        metrics.recordLayerExecution(layerId, false, layerDuration, 0);
        metrics.recordError('layer_execution', layerId);

        results.push({
          layerId,
          success: false,
          code: previous,
          executionTime: layerDuration,
          changeCount: 0,
          error: (error as Error).message
        });
      }
    }

    return {
      finalCode: current,
      results,
      states,
      totalExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
      successfulLayers: results.filter(r => r.success).length
    };
  }

  private static validateInput(
    code: string,
    requestedLayers?: number[],
    options?: ExecutionOptions
  ): void {
    if (!code || typeof code !== 'string') {
      throw new Error('Code input is required and must be a string');
    }

    if (code.length > 1000000) {
      throw new Error('Code input exceeds maximum size limit (1MB)');
    }

    if (requestedLayers && !Array.isArray(requestedLayers)) {
      throw new Error('requestedLayers must be an array of numbers');
    }

    // Updated to support up to Layer 7
    if (requestedLayers && requestedLayers.some(layer => !Number.isInteger(layer) || layer < 1 || layer > 7)) {
      throw new Error('Layer IDs must be integers between 1 and 7');
    }

    if (options && typeof options !== 'object') {
      throw new Error('Options must be an object');
    }
  }

  private static createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Transformation timed out after ${this.TIMEOUT_MS}ms`));
      }, this.TIMEOUT_MS);
    });
  }

  private static createLayerTimeoutPromise(layerId: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Layer ${layerId} timed out after 10 seconds`));
      }, 10000);
    });
  }

  private static generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static determineLayers(code: string, requestedLayers?: number[]): number[] {
    if (requestedLayers && requestedLayers.length > 0) {
      return requestedLayers;
    }

    const recommendation = SmartLayerSelector.analyzeAndRecommend(code);
    return recommendation.recommendedLayers;
  }

  private static async executeLayer(layerId: number, code: string, options: ExecutionOptions): Promise<string> {
    const layerConfig = LAYER_CONFIGS[layerId];

    if (!layerConfig) {
      throw new Error(`Unknown layer: ${layerId}`);
    }

    let transformedCode = code;

    switch (layerId) {
      case 1:
        if (code.includes('"target": "es5"')) {
          transformedCode = code.replace('"target": "es5"', '"target": "ES2020"');
        }
        break;

      case 2:
        transformedCode = code
          .replace(/"/g, '"')
          .replace(/&/g, '&')
          .replace(/</g, '<')
          .replace(/>/g, '>');
        break;

      case 3:
        if (code.includes('.map(') && !code.includes('key=')) {
          transformedCode = code.replace(
            /\.map\s*\(\s*([^)]+)\s*=>\s*<([^>]+)>/g,
            '.map($1 => <$2 key={$1.id || Math.random()}>'
          );
        }
        break;

      case 4:
        if (code.includes('localStorage') && !code.includes('typeof window')) {
          transformedCode = code.replace(
            /localStorage\./g,
            'typeof window !== "undefined" && localStorage.'
          );
        }
        break;

      case 5: // Next.js App Router Fixes
        if (!code.includes("'use client'") && code.includes('import')) {
          transformedCode = "'use client';\n" + code;
        } else if (code.includes('import') && !code.includes('React')) {
          transformedCode = code.replace(
            /^import\s+{([^}]*)} from ['"]react['"]/m,
            'import { React, $1 } from "react"'
          );
        }
        break;

      case 6: // Testing and Validation
        if (code.includes('function') && !code.includes('React.memo')) {
          transformedCode = code.replace(
            /(function\s+\w+\s*\([^)]*\)\s*{[^}]*})/,
            'React.memo($1)'
          );
        } else if (code.includes('<') && !code.includes('aria-')) {
          transformedCode = code.replace(/<(\w+)([^>]*?)>/g, '<$1$2 aria-label="accessible-element">');
        }
        break;

      case 7: // Adaptive Pattern Learning
        const learningResult = await this.patternLearner.applyLearnedRules(code);
        transformedCode = learningResult.transformedCode;
        logger.info('Applied learned rules', {
          ruleCount: learningResult.ruleCount,
          rules: learningResult.appliedRules
        });
        break;
    }

    await new Promise(resolve => setTimeout(resolve, 50));
    return transformedCode;
  }

  private static calculateChanges(before: string, after: string): number {
    const beforeLines = before.split('\n');
    const afterLines = after.split('\n');
    let changes = Math.abs(beforeLines.length - afterLines.length);

    const minLength = Math.min(beforeLines.length, afterLines.length);
    for (let i = 0; i < minLength; i++) {
      if (beforeLines[i] !== afterLines[i]) changes++;
    }

    return changes;
  }

  private static detectImprovements(before: string, after: string): string[] {
    const improvements: string[] = [];

    if (before !== after) {
      improvements.push('Code transformation applied');
    }

    if (before.includes('"') && !after.includes('"')) {
      improvements.push('HTML entities converted to proper quotes');
    }

    if (before.includes('console.log') && !after.includes('console.log')) {
      improvements.push('Console statements removed');
    }

    if (before.includes('.map(') && !before.includes('key=') && after.includes('key=')) {
      improvements.push('Missing key props added');
    }

    if (before.includes('localStorage') && !before.includes('typeof window') && after.includes('typeof window')) {
      improvements.push('SSR guards added for browser APIs');
    }

    if (!before.includes("'use client'") && after.includes("'use client'")) {
      improvements.push("Added 'use client' directive");
    }

    if (before.includes('function') && after.includes('React.memo')) {
      improvements.push('Added React.memo for performance');
    }

    if (before.includes('<') && !before.includes('aria-') && after.includes('aria-')) {
      improvements.push('Added accessibility attributes');
    }

    return improvements;
  }
}
```

### 4. Update SmartLayerSelector
Enhance `SmartLayerSelector` to recommend Layer 7 when code matches learned patterns or when previous transformations suggest potential for learning.

```typescript
// smart-selector.ts
import { PatternLearner } from './pattern-learner';

class SmartLayerSelector {
  private static readonly patternLearner = new PatternLearner();

  static analyzeAndRecommend(code: string, filePath?: string) {
    const issues = this.detectIssues(code, filePath);
    const recommendations = this.generateRecommendations(issues);

    // NEW: Recommend Layer 7 if learned rules match
    const learnedRules = this.patternLearner.rules;
    const matchingRules = learnedRules.filter(rule => rule.pattern instanceof RegExp && rule.pattern.test(code));
    if (matchingRules.length > 0) {
      recommendations.layers.push(7);
      recommendations.reasons.push(`Layer 7: ${matchingRules.length} learned patterns match code`);
    }

    return {
      recommendedLayers: recommendations.layers,
      detectedIssues: issues,
      reasoning: recommendations.reasons,
      confidence: this.calculateConfidence(issues),
      estimatedImpact: this.estimateImpact(issues)
    };
  }

  // ... rest of the SmartLayerSelector code ...
}
```

### 5. Update Testing Strategies
Add tests for Layer 7 in `LayerOrchestrationTester`:

```typescript
// layer-orchestration-tester.ts
class LayerOrchestrationTester {
  private async runUnitTests(): Promise<void> {
    const unitTests = [
      // ... existing tests ...
      {
        name: 'Layer 7: Adaptive Pattern Learning',
        input: `
          function MyComponent() {
            return <div>Hello</div>;
          }
        `,
        expectedChanges: ['Code transformation applied'], // Will depend on learned rules
        layer: 7
      }
    ];

    for (const test of unitTests) {
      await this.runSingleTest(test);
    }
  }

  private async runIntegrationTests(): Promise<void> {
    const integrationTests = [
      // ... existing tests ...
      {
        name: 'Learn and Apply Pattern (Layers 5, 6, 7)',
        input: `
          import { useState } from 'react';
          function MyComponent() {
            return <div>Hello</div>;
          }
        `,
        layers: [5, 6, 7],
        expectedResults: {
          minChanges: 2, // Expect changes from Layers 5 and 6, potentially 7
          shouldSucceed: true,
          layersExecuted: 5 // Includes dependencies (1, 2, 3)
        }
      }
    ];

    for (const test of integrationTests) {
      await this.runIntegrationTest(test);
    }
  }
}
```

### 6. Example Usage
Here’s how to use the updated orchestrator with Layer 7:

```typescript
// main.ts
import { NeuroLintOrchestrator } from './orchestrator';

const sampleCode = `
import { useState } from 'react';
function MyComponent() {
  return <div>Hello</div>;
}
`;

async function main() {
  const result = await NeuroLintOrchestrator.transform(sampleCode, [5, 6, 7], {
    verbose: true
  });
  console.log('Final Code:', result.finalCode);
  console.log('Improvements:', result.results.flatMap(r => r.improvements || []));
}

main();
```

**Expected Behavior**:
- Layers 5 and 6 add `'use client'` and `React.memo`/accessibility attributes.
- Layer 7 learns these patterns (e.g., adding `'use client'` to files with React imports).
- On subsequent runs, Layer 7 applies learned rules if applicable.
- The `PatternLearner` stores rules in `learned-rules.json`, e.g.:

```json
[
  {
    "pattern": "/^((?:import\\s.*?\n)+)/",
    "replacement": "'use client';\n$1",
    "confidence": 0.7,
    "frequency": 1,
    "sourceLayer": 5,
    "createdAt": 1736392500000,
    "description": "Add 'use client' directive at top of file"
  }
]
```

---

## Considerations for Pattern Learning

1. **Pattern Extraction**:
   - The current implementation uses simple regex-based patterns. For more complex transformations (e.g., AST-based changes in Layers 5 and 6), you could extend `PatternLearner` to analyze AST differences using libraries like `@babel/parser` and `@babel/traverse`.

2. **Confidence and Validation**:
   - Rules start with a confidence of 0.7 and increase with successful applications. Use `TransformationValidator` to validate learned rules before permanent storage.
   - Add a feedback mechanism (e.g., user approval) to increase confidence or remove low-performing rules.

3. **Scalability**:
   - The JSON-based storage is simple but may not scale for large rule sets. Consider a database (e.g., SQLite) for production use.
   - Implement rule pruning to remove low-confidence or outdated rules.

4. **Extending to AST**:
   - For Layers 5 and 6, which use AST, you can extract patterns by comparing AST nodes before and after transformations. Use `@babel/traverse` to identify changed nodes and generate reusable AST transformations.

5. **Error Handling**:
   - The `ErrorRecoverySystem` will catch issues in Layer 7, ensuring failed rule applications don’t break the pipeline.

---

## Future Enhancements

- **Machine Learning Integration**: Use a lightweight ML model (e.g., clustering) to identify complex patterns across multiple files, improving rule generalization.
- **User Feedback Loop**: Allow users to approve/reject learned rules via a CLI or UI, adjusting confidence scores.
- **AST-Based Learning**: Extend `PatternLearner` to store and apply AST transformations, leveraging the existing AST support in Layers 3–6.
- **Performance Optimization**: Cache frequently applied rules in memory and skip redundant transformations using `PerformanceOptimizer`.

---

## Testing and Validation

Run the test suite to ensure Layer 7 integrates correctly:

```typescript
// test.ts
import { LayerOrchestrationTester } from './layer-orchestration-tester';

async function runTests() {
  const tester = new LayerOrchestrationTester();
  const results = await tester.runTestSuite();
  console.log('Test Summary:', results.summary);
  if (results.failedTests.length) {
    console.log('Failed Tests:', results.failedTests);
  }
}

runTests();
```

Add specific tests for Layer 7 to verify:
- Rules are learned from Layers 5 and 6 (e.g., `'use client'` addition, `React.memo` wrapping).
- Learned rules are correctly applied to new code.
- Validation prevents faulty rules from being applied.

---

## Conclusion

By adding Layer 7 and the `PatternLearner` class, you’ve extended `NeuroLintOrchestrator` to learn fix patterns from Layers 1–6 and apply them dynamically. The implementation leverages the existing architecture (validation, dependency management, error recovery) while introducing a persistent rule store and confidence-based application logic. If you have specific transformations from Layers 5 or 6 you want to prioritize for learning, or if you need help with AST-based pattern extraction, let me know, and I can provide tailored code examples!