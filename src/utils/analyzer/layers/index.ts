import { CodeIssue } from '@/types/analysis';
import { Layer1ConfigAnalyzer } from './layer1ConfigAnalyzer';
import { Layer2PatternsAnalyzer } from './layer2PatternsAnalyzer';
import { Layer3ComponentsAnalyzer } from './layer3ComponentsAnalyzer';
import { Layer4HydrationAnalyzer } from './layer4HydrationAnalyzer';
import { Layer5NextJsAnalyzer } from './layer5NextJsAnalyzer';
import { Layer6TestingAnalyzer } from './layer6TestingAnalyzer';
/**
 * Layered Code Analysis System
 * Based on the comprehensive multi-layer analysis approach
 * 
 * Layer 1: Configuration and Setup Issues (Critical)
 * Layer 2: Pattern and Import Issues (High)
 * Layer 3: Component Structure Issues (Medium)
 * Layer 4: Hydration and SSR Issues (Medium)
 * Layer 5: Next.js App Router Issues (Low)
 * Layer 6: Testing and Validation Issues (Low)
 */
export class LayeredAnalyzer {
  private layer1: Layer1ConfigAnalyzer;
  private layer2: Layer2PatternsAnalyzer;
  private layer3: Layer3ComponentsAnalyzer;
  private layer4: Layer4HydrationAnalyzer;
  private layer5: Layer5NextJsAnalyzer;
  private layer6: Layer6TestingAnalyzer;
  constructor() {
    this.layer1 = new Layer1ConfigAnalyzer();
    this.layer2 = new Layer2PatternsAnalyzer();
    this.layer3 = new Layer3ComponentsAnalyzer();
    this.layer4 = new Layer4HydrationAnalyzer();
    this.layer5 = new Layer5NextJsAnalyzer();
    this.layer6 = new Layer6TestingAnalyzer();
  }
  async analyzeFile(fileName: string, content: string): Promise<CodeIssue[]> {
    const allIssues: CodeIssue[] = [];
    try {
      // Layer 1: Critical configuration issues
      const layer1Issues = this.layer1.analyze(fileName, content);
      allIssues.push(...layer1Issues);
      // Layer 2: Pattern and import issues
      const layer2Issues = this.layer2.analyze(fileName, content);
      allIssues.push(...layer2Issues);
      // Layer 3: Component structure issues
      const layer3Issues = this.layer3.analyze(fileName, content);
      allIssues.push(...layer3Issues);
      // Layer 4: Hydration and SSR issues
      const layer4Issues = this.layer4.analyze(fileName, content);
      allIssues.push(...layer4Issues);
      // Layer 5: Next.js App Router issues
      const layer5Issues = this.layer5.analyze(fileName, content);
      allIssues.push(...layer5Issues);
      // Layer 6: Testing and validation issues
      const layer6Issues = this.layer6.analyze(fileName, content);
      allIssues.push(...layer6Issues);
      return allIssues;
    } catch (error) {
      console.error(`Error analyzing ${fileName}:`, error);
      return [];
    }
  }
  async analyzeProject(files: { fileName: string; content: string }[]): Promise<{
    files: Array<{ fileName: string; content: string; issues: CodeIssue[] }>;
    summary: {
      totalIssues: number;
      errorCount: number;
      warningCount: number;
      infoCount: number;
      fixableCount: number;
      autoFixableCount: number;
      criticalIssues: number;
      layerBreakdown: { [key: number]: number };
    };
  }> {
    const results = [];
    const layerBreakdown: { [key: number]: number } = {};
    for (const file of files) {
      const issues = await this.analyzeFile(file.fileName, file.content);
      results.push({
        fileName: file.fileName,
        content: file.content,
        issues
      });
      // Count issues by layer
      issues.forEach(issue => {
        layerBreakdown[issue.layer] = (layerBreakdown[issue.layer] || 0) + 1;
      });
    }
    const allIssues = results.flatMap(r => r.issues);
    return {
      files: results,
      summary: {
        totalIssues: allIssues.length,
        errorCount: allIssues.filter(i => i.severity === 'error').length,
        warningCount: allIssues.filter(i => i.severity === 'warning').length,
        infoCount: allIssues.filter(i => i.severity === 'info').length,
        fixableCount: allIssues.filter(i => i.fixable).length,
        autoFixableCount: allIssues.filter(i => i.autoFixable).length,
        criticalIssues: allIssues.filter(i => i.severity === 'error' && i.layer <= 2).length,
        layerBreakdown
      }
    };
  }
  getLayerDescription(layer: number): string {
    const descriptions = {
      1: 'Configuration and Setup Issues (Critical)',
      2: 'Pattern and Import Issues (High Priority)',
      3: 'Component Structure Issues (Medium Priority)',
      4: 'Hydration and SSR Issues (Medium Priority)',
      5: 'Next.js App Router Issues (Low Priority)',
      6: 'Testing and Validation Issues (Low Priority)'
    };
    return descriptions[layer] || 'Unknown Layer';
  }
}
export * from './layer1ConfigAnalyzer';
export * from './layer2PatternsAnalyzer';
export * from './layer3ComponentsAnalyzer';
export * from './layer4HydrationAnalyzer';
export * from './layer5NextJsAnalyzer';
export * from './layer6TestingAnalyzer'; 