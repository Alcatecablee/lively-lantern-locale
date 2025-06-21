import React from 'react';
import { ProjectAnalysis, CodeIssue } from '@/types/analysis';
import { AlertTriangle, CheckCircle, Info, XCircle, Zap, Code, Activity, AlertCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EducationalButton } from '@/components/education';

interface AnalysisResultsProps extends React.HTMLAttributes<HTMLDivElement> {
  analysis: ProjectAnalysis;
  onFixIssue?: (issue: CodeIssue) => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  onFixIssue
}) => {
  const getLayerInfo = (layer: number) => {
    const layerConfig = {
      1: { name: 'Critical Issues', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-800/50', icon: XCircle },
      2: { name: 'Performance Issues', color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-800/50', icon: Zap },
      3: { name: 'Best Practices', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-800/50', icon: AlertTriangle },
      4: { name: 'Code Quality', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800/50', icon: Code },
      5: { name: 'Accessibility', color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-800/50', icon: AlertCircle },
      6: { name: 'Modern Patterns', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-800/50', icon: Lightbulb }
    };
    return layerConfig[layer as keyof typeof layerConfig] || layerConfig[4];
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-800/50 bg-red-900/20';
      case 'warning':
        return 'border-yellow-800/50 bg-yellow-900/20';
      case 'info':
        return 'border-blue-800/50 bg-blue-900/20';
      default:
        return 'border-green-800/50 bg-green-900/20';
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMetricBarColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Group issues by layer for better organization
  const issuesByLayer = analysis.files.reduce((acc, file) => {
    file.issues.forEach(issue => {
      if (!acc[issue.layer]) {
        acc[issue.layer] = [];
      }
      acc[issue.layer].push({ ...issue, fileName: file.fileName });
    });
    return acc;
  }, {} as Record<number, (CodeIssue & { fileName: string })[]>);

  const layerStats = Object.keys(issuesByLayer).map(layer => {
    const layerNum = parseInt(layer);
    const layerIssues = issuesByLayer[layerNum];
    const layerInfo = getLayerInfo(layerNum);

    return {
      layer: layerNum,
      ...layerInfo,
      count: layerIssues.length,
      errorCount: layerIssues.filter(i => i.severity === 'error').length,
      warningCount: layerIssues.filter(i => i.severity === 'warning').length,
      autoFixableCount: layerIssues.filter(i => i.autoFixable).length
    };
  }).sort((a, b) => a.layer - b.layer);

  return (
    <div className="space-y-8">
      {/* Enhanced Summary Dashboard */}
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-2xl">
        <div className="flex items-center mb-8">
          <Activity className="h-6 w-6 text-blue-400 mr-3" />
          <h2 className="text-2xl font-bold text-white">Analysis Summary</h2>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-white mb-1">{analysis.summary.totalIssues}</div>
            <div className="text-sm text-gray-400">Total Issues</div>
          </div>
          <div className="text-center bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-red-400 mb-1">{analysis.summary.errorCount}</div>
            <div className="text-sm text-gray-400">Errors</div>
          </div>
          <div className="text-center bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{analysis.summary.warningCount}</div>
            <div className="text-sm text-gray-400">Warnings</div>
          </div>
          <div className="text-center bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-green-400 mb-1">{analysis.summary.autoFixableCount}</div>
            <div className="text-sm text-gray-400">Auto-fixable</div>
          </div>
        </div>

        {/* Layer Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Issues by Analysis Layer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {layerStats.map(({ layer, name, color, bg, border, icon: LayerIcon, count, errorCount, warningCount, autoFixableCount }) => (
              <div key={layer} className={cn("rounded-lg p-4 border", bg, border)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <LayerIcon className={cn("h-5 w-5 mr-2", color)} />
                    <span className={cn("font-medium", color)}>Layer {layer}</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{count}</span>
                </div>
                <div className="text-sm text-gray-300 mb-2">{name}</div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{errorCount} errors</span>
                  <span>{warningCount} warnings</span>
                  <span>{autoFixableCount} fixable</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layer-based Issue Display */}
      {layerStats.map(({ layer, name, color, bg, border, icon: LayerIcon }) => {
        const layerIssues = issuesByLayer[layer] || [];
        if (layerIssues.length === 0) return null;

        return (
          <div key={layer} className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <LayerIcon className={cn("h-6 w-6 mr-3", color)} />
                <h3 className="text-xl font-semibold text-white">Layer {layer}: {name}</h3>
                <span className="ml-3 px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-full">
                  {layerIssues.length} issues
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {layerIssues.map((issue, index) => (
                <div
                  key={`${issue.id}-${index}`}
                  className={cn(
                    "border rounded-lg p-6 transition-all duration-200 hover:shadow-lg",
                    getSeverityColor(issue.severity)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-white text-lg">{issue.message}</span>
                          <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                            {issue.fileName}
                          </span>
                          {issue.autoFixable && (
                            <span className="text-xs bg-green-800/50 text-green-300 px-3 py-1 rounded-full flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto-fixable
                            </span>
                          )}
                        </div>
                        {issue.suggestion && (
                          <p className="text-gray-300 mb-3 leading-relaxed">{issue.suggestion}</p>
                        )}
                        {issue.example && (
                          <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg text-sm font-mono text-gray-300">
                            {issue.example}
                          </div>
                        )}
                      </div>
                    </div>
                    {issue.fixable && onFixIssue && (
                      <button aria-label="Button"
                        onClick={() => onFixIssue(issue)}
                        className={cn(
                          "ml-4 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                          issue.autoFixable 
                            ? "bg-green-600 hover:bg-green-700 text-white" 
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                      >
                        {issue.autoFixable ? 'Auto Fix' : 'Guide Fix'}
                      </button>
                    )}
                  </div>

                  {/* Educational Button Section */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <EducationalButton 
                        issue={issue} 
                        className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* File-specific Results */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Code className="h-6 w-6 mr-3 text-blue-400" />
          File Analysis Details
        </h2>

        {analysis.files.map((fileResult, index) => (
          <div key={index} className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Code className="h-5 w-5 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">{fileResult.fileName}</h3>
              </div>
              <div className="flex space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-400">Complexity: </span>
                  <span className={cn("font-semibold ml-1", getMetricColor(fileResult.metrics.complexity))}>
                    {fileResult.metrics.complexity}%
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-400">Maintainability: </span>
                  <span className={cn("font-semibold ml-1", getMetricColor(fileResult.metrics.maintainability))}>
                    {fileResult.metrics.maintainability}%
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-gray-400">Performance: </span>
                  <span className={cn("font-semibold ml-1", getMetricColor(fileResult.metrics.performance))}>
                    {fileResult.metrics.performance}%
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Bars */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Complexity</span>
                  <span className={getMetricColor(fileResult.metrics.complexity)}>{fileResult.metrics.complexity}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className={cn("h-2 rounded-full", getMetricBarColor(fileResult.metrics.complexity))}
                    style={{ width: `${fileResult.metrics.complexity}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Maintainability</span>
                  <span className={getMetricColor(fileResult.metrics.maintainability)}>{fileResult.metrics.maintainability}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className={cn("h-2 rounded-full", getMetricBarColor(fileResult.metrics.maintainability))}
                    style={{ width: `${fileResult.metrics.maintainability}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Performance</span>
                  <span className={getMetricColor(fileResult.metrics.performance)}>{fileResult.metrics.performance}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className={cn("h-2 rounded-full", getMetricBarColor(fileResult.metrics.performance))}
                    style={{ width: `${fileResult.metrics.performance}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {fileResult.issues.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-green-400 bg-green-900/20 border border-green-800/50 rounded-lg">
                <CheckCircle className="h-6 w-6 mr-3" />
                <span className="text-lg font-medium">No issues found - excellent code quality!</span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-400">
                  {fileResult.issues.length} issues found in this file. See layer breakdown above for details.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
