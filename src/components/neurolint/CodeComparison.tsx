
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, GitCompare, FileText, AlertCircle } from 'lucide-react';

interface CodeComparisonProps {
  results: {
    originalCode?: string;
    transformed?: string;
    processingTime?: number;
    enabledLayers?: number[];
    error?: string;
  };
}

export function CodeComparison({ results }: CodeComparisonProps) {
  if (results.error) {
    return (
      <Card className="bg-red-900/20 border-red-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>Error: {results.error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasChanges = results.originalCode !== results.transformed;
  const originalLines = results.originalCode?.split('\n').length || 0;
  const transformedLines = results.transformed?.split('\n').length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">Code Comparison</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={hasChanges ? "default" : "secondary"}>
            {hasChanges ? "Changes Detected" : "No Changes"}
          </Badge>
          {results.processingTime && (
            <Badge variant="outline">
              {results.processingTime}ms
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-black/30 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-sm">
              <FileText className="w-4 h-4" />
              Original Code
              <Badge variant="outline" className="ml-auto">
                {originalLines} lines
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-900/50 p-3 rounded-lg overflow-auto max-h-[400px] text-gray-300 font-mono">
              {results.originalCode || 'No original code available'}
            </pre>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-sm">
              <Code className="w-4 h-4" />
              Transformed Code
              <Badge variant="outline" className="ml-auto">
                {transformedLines} lines
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-900/50 p-3 rounded-lg overflow-auto max-h-[400px] text-gray-300 font-mono">
              {results.transformed || 'No transformed code available'}
            </pre>
          </CardContent>
        </Card>
      </div>

      {hasChanges && (
        <Card className="bg-green-900/20 border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-400">
              <Code className="w-5 h-5" />
              <span>
                Code transformation completed with {Math.abs(transformedLines - originalLines)} line difference
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
