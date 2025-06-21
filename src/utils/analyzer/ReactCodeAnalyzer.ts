import { CodeIssue, AnalysisResult, ProjectAnalysis } from '@/types/analysis';
import { LayeredAnalyzer } from './layers';

export class ReactCodeAnalyzer {
  private layeredAnalyzer: LayeredAnalyzer;

  constructor() {
    this.layeredAnalyzer = new LayeredAnalyzer();
  }

  async analyzeFile(fileName: string, content: string): Promise<AnalysisResult> {
    console.debug(`🔍 Analyzing file: ${fileName}`);

    try {
      const issues = await this.layeredAnalyzer.analyzeFile(fileName, content);

      console.debug(`✅ Found ${issues.length} issues in ${fileName}`);
      if (issues.length > 0) {
        console.debug('Issues found:', issues.map(i => `${i.id} (${i.type}, Layer ${i.layer})`));
      }

      // Calculate basic metrics
      const metrics = this.calculateMetrics(content, issues);

      return {
        fileName,
        content,
        issues,
        metrics
      };
    } catch (error) {
      console.error(`❌ Error analyzing ${fileName}:`, error);
      return {
        fileName,
        content,
        issues: [],
        metrics: { complexity: 100, maintainability: 100, performance: 100 }
      };
    }
  }

  async analyzeProject(files: { name: string; content: string }[]): Promise<ProjectAnalysis> {
    console.debug(`🚀 Starting project analysis of ${files.length} files using layered analyzer`);

    try {
      // Prepare files for layered analyzer
      const formattedFiles = files.map(file => ({
        fileName: file.name,
        content: file.content
      }));

      // Use the layered analyzer to get real analysis results
      const result = await this.layeredAnalyzer.analyzeProject(formattedFiles);

      console.debug(`✅ Analysis complete: Found ${result.summary.totalIssues} total issues`);
      console.debug(`📊 Layer breakdown:`, result.summary.layerBreakdown);
      console.debug(`🔥 Critical issues: ${result.summary.criticalIssues}`);

      // Convert to expected format
      const analysisResults = result.files.map(file => ({
        fileName: file.fileName,
        content: file.content,
        issues: file.issues,
        metrics: this.calculateMetrics(file.content, file.issues)
      }));

      return {
        files: analysisResults,
        summary: result.summary
      };
    } catch (error) {
      console.error('❌ Project analysis failed:', error);

      // Fallback to individual file analysis
      const analysisResults = await Promise.all(
        files.map(file => this.analyzeFile(file.name, file.content))
      );

      const allIssues = analysisResults.flatMap(result => result.issues);

      const summary = {
        totalIssues: allIssues.length,
        errorCount: allIssues.filter(i => i.severity === 'error').length,
        warningCount: allIssues.filter(i => i.severity === 'warning').length,
        infoCount: allIssues.filter(i => i.severity === 'info').length,
        fixableCount: allIssues.filter(i => i.fixable).length,
        autoFixableCount: allIssues.filter(i => i.autoFixable).length,
        criticalIssues: allIssues.filter(i => i.severity === 'error' && i.layer <= 2).length,
      };

      return {
        files: analysisResults,
        summary
      };
    }
  }

  getLayerDescription(layer: number): string {
    return this.layeredAnalyzer.getLayerDescription(layer);
  }

  private calculateMetrics(content: string, issues: CodeIssue[]) {
    const lines = content.split('\n').length;
    const complexity = Math.max(0, 100 - (issues.filter(i => i.severity === 'error').length * 10));
    const maintainability = Math.max(0, 100 - (issues.length * 2));
    const performance = Math.max(0, 100 - (issues.filter(i => i.type === 'performance').length * 15));

    return {
      complexity,
      maintainability,
      performance,
      lines
    };
  }

  private isReactFile(fileName: string): boolean {
    return fileName.endsWith('.tsx') || 
           fileName.endsWith('.jsx') || 
           fileName.endsWith('.ts') || 
           fileName.endsWith('.js');
  }
}