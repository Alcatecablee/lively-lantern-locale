
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Code, Brain } from 'lucide-react';
import { TestResult } from '@/lib/neurolint/testSuite';

interface TestResultCardProps {
  result: TestResult;
  index: number;
}

export function TestResultCard({ result, index }: TestResultCardProps) {
  return (
    <Card className={`${result.passed ? 'border-green-200' : 'border-red-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {result.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-base">{result.testCase.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{result.testCase.category}</Badge>
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              {result.executionTime}ms
            </Badge>
            {result.semanticAnalysis && (
              <Badge variant="outline" className="text-purple-600">
                <Brain className="w-3 h-3 mr-1" />
                Semantic
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {result.testCase.description}
        </p>

        <Tabs defaultValue="results">
          <TabsList>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="code">Code Diff</TabsTrigger>
            {result.layers && <TabsTrigger value="layers">Layers</TabsTrigger>}
            {result.conflicts && <TabsTrigger value="conflicts">Conflicts</TabsTrigger>}
            {result.semanticAnalysis && <TabsTrigger value="semantic">Semantic</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="results" className="space-y-3">
            {result.detectedFixes.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Detected Fixes ({result.detectedFixes.length})
                </h4>
                <div className="grid gap-1">
                  {result.detectedFixes.map((fix, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      {fix}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.missingFixes.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Missing Fixes ({result.missingFixes.length})
                </h4>
                <div className="grid gap-1">
                  {result.missingFixes.map((fix, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="w-3 h-3" />
                      {fix}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.error && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">Error</h4>
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {result.error}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="code">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Original
                </h4>
                <ScrollArea className="h-64 rounded border bg-muted p-3">
                  <pre className="text-xs">
                    <code>{result.testCase.input}</code>
                  </pre>
                </ScrollArea>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Transformed
                </h4>
                <ScrollArea className="h-64 rounded border bg-muted p-3">
                  <pre className="text-xs">
                    <code>{result.transformedCode}</code>
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {result.layers && (
            <TabsContent value="layers">
              <div className="space-y-2">
                <h4 className="font-medium">Layer Results</h4>
                {result.layers.map((layer, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{layer.name}</span>
                    <div className="flex items-center gap-2">
                      {layer.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <Badge variant="outline">{layer.executionTime}ms</Badge>
                      {layer.changeCount !== undefined && (
                        <Badge variant="secondary">{layer.changeCount} changes</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {result.conflicts && (
            <TabsContent value="conflicts">
              <div className="space-y-2">
                <h4 className="font-medium">Conflict Analysis</h4>
                {result.conflicts.hasConflicts ? (
                  <div className="space-y-2">
                    <Badge variant="destructive">
                      {result.conflicts.conflicts.length} conflicts detected
                    </Badge>
                    {result.conflicts.conflicts.map((conflict: any, i: number) => (
                      <div key={i} className="p-2 bg-red-50 rounded text-sm">
                        <strong>{conflict.severity}:</strong> {conflict.description}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Badge variant="default">No conflicts detected</Badge>
                )}
              </div>
            </TabsContent>
          )}

          {result.semanticAnalysis && (
            <TabsContent value="semantic">
              <div className="space-y-2">
                <h4 className="font-medium">Semantic Analysis</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Complexity Change:</strong> {result.semanticAnalysis.complexityChange}
                  </div>
                  <div>
                    <strong>Risk Factors Added:</strong> {result.semanticAnalysis.riskFactorsAdded.length}
                  </div>
                </div>
                {result.validationReport && (
                  <div className="mt-2">
                    <Badge variant={result.validationReport.passed ? "default" : "destructive"}>
                      Validation Score: {result.validationReport.score}/100
                    </Badge>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
