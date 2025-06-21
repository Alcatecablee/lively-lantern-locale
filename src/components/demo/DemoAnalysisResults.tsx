import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react';
import { ProjectAnalysis, IssueSeverity } from '@/types/analysis';

interface DemoAnalysisResultsProps extends React.HTMLAttributes<HTMLDivElement> {}
  analysis: ProjectAnalysis;
}

export const DemoAnalysisResults: React.FC<DemoAnalysisResultsProps> = ({ analysis }) => {};
  const getSeverityIcon = (severity: IssueSeverity) => {
    switch (severity) {;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case 'error': return 'text-red-300 bg-red-900/30 border-red-600/50';
      case 'warning': return 'text-yellow-300 bg-yellow-900/30 border-yellow-600/50';
      case 'info': return 'text-blue-300 bg-blue-900/30 border-blue-600/50';
    }
  };

  // Group issues by severity for better display
  const groupedIssues = analysis.files[0]?.issues.reduce((acc, issue) => {
    if (!acc[issue.severity]) acc[issue.severity] = [];
    acc[issue.severity].push(issue);
    return acc;
  }, {} as Record<IssueSeverity, typeof analysis.files[0]['issues']>) || {};

  if (analysis.summary.totalIssues === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-20 h-20 mx-auto text-green-400 mb-6" />
        <h3 className="text-xl font-semibold text-green-400 mb-3">
          Great job! No issues found
        </h3>
        <p className="text-gray-300">
          Your code follows React best practices
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-600/50">
          <div className="text-3xl font-bold text-red-400">{analysis.summary.errorCount}</div>
          <div className="text-sm text-red-300">Errors</div>
        </div>
        <div className="text-center p-4 bg-yellow-900/30 rounded-lg border border-yellow-600/50">
          <div className="text-3xl font-bold text-yellow-400">{analysis.summary.warningCount}</div>
          <div className="text-sm text-yellow-300">Warnings</div>
        </div>
        <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-600/50">
          <div className="text-3xl font-bold text-blue-400">{analysis.summary.infoCount}</div>
          <div className="text-sm text-blue-300">Info</div>
        </div>
      </div>

      {/* Auto-fixable Issues Badge */}
      {analysis.summary.autoFixableCount > 0 && (
        <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-600/50">
          <CheckCircle className="w-3 h-3 mr-1" />
          {analysis.summary.autoFixableCount} issues can be auto-fixed
        </Badge>
      )}

      {/* Issues List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {(['error', 'warning', 'info'] as IssueSeverity[]).map(severity => {
          const issues = groupedIssues[severity] || [];
          if (issues.length === 0) return null;

          return (
            <div key={severity}>
              {issues.slice(0, 3).map((issue, index) => (
                <Card key={`${severity}-${index}`} className={`${getSeverityColor(issue.severity)} border bg-gray-800/50 mb-3`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-sm text-white">{issue.message}</p>
                          {issue.autoFixable && (
                            <Badge variant="outline" className="text-xs bg-green-900/30 text-green-400 border-green-600/50">
                              Auto-fixable
                            </Badge>
                          )}
                        </div>
                        {issue.suggestion && (
                          <p className="text-xs text-gray-300 mt-2 opacity-90">
                            💡 {issue.suggestion}
                          </p>
                        )}
                        {issue.line && (
                          <p className="text-xs text-gray-400 mt-2">
                            Line {issue.line}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {issues.length > 3 && (
                <p className="text-xs text-gray-400 text-center py-3">
                  ... and {issues.length - 3} more {severity} issues
                </p>
              )}
            </div>
          );
        )}
      </div>
    </div>
  );
