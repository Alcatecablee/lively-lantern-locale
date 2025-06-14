
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlayCircle, CheckCircle, XCircle, Clock, Code, Zap, Settings, Shield, Brain } from 'lucide-react';
import { NeuroLintEnhancedOrchestrator } from '@/lib/neurolint/orchestrator-enhanced';
import { TEST_CASES, validateTestResult, TestResult } from '@/lib/neurolint/testSuite';

export function TestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  
  // Configuration options
  const [useAST, setUseAST] = useState(true);
  const [enableConflictDetection, setEnableConflictDetection] = useState(true);
  const [enableSemanticAnalysis, setEnableSemanticAnalysis] = useState(true);

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    const testResults: TestResult[] = [];

    for (let i = 0; i < TEST_CASES.length; i++) {
      const testCase = TEST_CASES[i];
      setCurrentTest(testCase.name);
      setProgress((i / TEST_CASES.length) * 100);

      const startTime = Date.now();
      
      try {
        // Use the enhanced orchestrator with all robustness features
        const result = await NeuroLintEnhancedOrchestrator(
          testCase.input, 
          undefined, 
          useAST,
          enableConflictDetection,
          enableSemanticAnalysis
        );
        
        const validation = validateTestResult(testCase, result.transformed);
        const executionTime = Date.now() - startTime;

        testResults.push({
          testCase,
          transformedCode: result.transformed,
          passed: validation.passed,
          detectedFixes: validation.detectedFixes,
          missingFixes: validation.missingFixes,
          executionTime,
          // Enhanced result data
          layers: result.layers,
          conflicts: result.conflicts,
          changeAnalysis: result.changeAnalysis,
          semanticAnalysis: result.semanticAnalysis,
          validationReport: result.validationReport
        });
      } catch (error) {
        const executionTime = Date.now() - startTime;
        testResults.push({
          testCase,
          transformedCode: testCase.input,
          passed: false,
          detectedFixes: [],
          missingFixes: testCase.expectedFixes,
          executionTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      setResults([...testResults]);
    }

    setProgress(100);
    setCurrentTest('');
    setIsRunning(false);
  };

  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Enhanced NeuroLint Test Suite
            <Badge variant="outline" className="ml-auto">
              Phase {enableSemanticAnalysis ? '3' : enableConflictDetection ? '2' : '1'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Configuration Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ast-mode"
                  checked={useAST}
                  onCheckedChange={setUseAST}
                />
                <Label htmlFor="ast-mode" className="text-sm">
                  AST-based transforms
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="conflict-detection"
                  checked={enableConflictDetection}
                  onCheckedChange={setEnableConflictDetection}
                />
                <Label htmlFor="conflict-detection" className="text-sm flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Conflict Detection
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="semantic-analysis"
                  checked={enableSemanticAnalysis}
                  onCheckedChange={setEnableSemanticAnalysis}
                />
                <Label htmlFor="semantic-analysis" className="text-sm flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Semantic Analysis
                </Label>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                {isRunning ? 'Running Enhanced Tests...' : 'Run All Tests'}
              </Button>
              
              {results.length > 0 && (
                <div className="flex items-center gap-4">
                  <Badge variant={passRate === 100 ? "default" : passRate > 50 ? "secondary" : "destructive"}>
                    {passedTests}/{totalTests} Passed ({passRate.toFixed(1)}%)
                  </Badge>
                </div>
              )}
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Running: {currentTest}
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((result, index) => (
            <Card key={index} className={`${result.passed ? 'border-green-200' : 'border-red-200'}`}>
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
          ))}
        </div>
      )}
    </div>
  );
}
