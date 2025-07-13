
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, CheckCircle, XCircle, Clock, Code, Zap, Settings } from 'lucide-react';
import { NeuroLintOrchestrator, LAYER_LIST } from '@/lib/neurolint/orchestrator';
import { TEST_CASES, validateTestResult, TestResult } from '@/lib/neurolint/testSuite';
import { LayerSelector } from './LayerSelector';

export function TestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResultWithLayers[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [useAST, setUseAST] = useState(true);
  // Track enabled layers
  const [enabledLayers, setEnabledLayers] = useState(LAYER_LIST.map(l => l.id));

  // Store per-layer pipeline output for each test
  const [pipelineStates, setPipelineStates] = useState<string[][]>([]);

  // We need to store the enabledLayers used for each test run, so we update TestResult type below
  type TestResultWithLayers = TestResult & { pipeline: string[]; testEnabledLayers: number[] };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    setPipelineStates([]);

    const testResults: TestResultWithLayers[] = [];
    const layerPipelines: string[][] = [];

    for (let i = 0; i < TEST_CASES.length; i++) {
      const testCase = TEST_CASES[i];
      setCurrentTest(testCase.name);
      setProgress((i / TEST_CASES.length) * 100);

      // Capture enabledLayers for this test run
      const testEnabledLayers = [...enabledLayers];

      const startTime = Date.now();
      try {
        // Pass enabledLayers to orchestrator
        const { transformed, layers, layerOutputs, backup } = await NeuroLintOrchestrator(
          testCase.input,
          undefined,
          useAST,
          testEnabledLayers
        );
        const validation = validateTestResult(testCase, transformed);
        const executionTime = Date.now() - startTime;

        testResults.push({
          testCase,
          transformedCode: transformed,
          passed: validation.passed,
          detectedFixes: validation.detectedFixes,
          missingFixes: validation.missingFixes,
          executionTime,
          // Map NeuroLintLayerResult[] to the expected layerResults format
          layerResults: layers.map(layer => ({
            layerId: layer.layerId || 0,
            success: layer.success,
            changes: layer.changeCount || 0,
            reverted: layer.reverted || false
          })),
          validationPassed: validation.passed,
          backupCreated: !!backup,
          // Store per-test pipeline and enabled layers
          pipeline: layerOutputs,
          testEnabledLayers,
        });
        layerPipelines.push(layerOutputs);
      } catch (error) {
        const executionTime = Date.now() - startTime;
        testResults.push({
          testCase,
          transformedCode: testCase.input,
          passed: false,
          detectedFixes: [],
          missingFixes: testCase.expectedFixes,
          executionTime,
          // Add missing required properties from TestResult interface
          layerResults: [],
          validationPassed: false,
          backupCreated: false,
          pipeline: [testCase.input],
          testEnabledLayers,
        });
        layerPipelines.push([testCase.input]);
      }
      setResults([...testResults]);
      setPipelineStates([...layerPipelines]);
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
            NeuroLint Test Suite
            <Badge variant="outline" className="ml-auto">
              {useAST ? 'AST-based' : 'Regex-based'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Layer selector UI */}
          <div className="my-3 flex flex-col sm:flex-row gap-3 items-center">
            <LayerSelector enabledLayers={enabledLayers} setEnabledLayers={setEnabledLayers} />
            <Button
              variant="outline"
              onClick={() => setEnabledLayers(LAYER_LIST.map(l => l.id))}
              disabled={enabledLayers.length === LAYER_LIST.length}
              className="ml-auto"
            >
              All Layers
            </Button>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning || enabledLayers.length === 0}
              className="flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              {isRunning ? 'Running Tests...' : `Run ${enabledLayers.length === LAYER_LIST.length ? "All" : "Selected"} Layer${enabledLayers.length !== 1 ? "s" : ""} Tests`}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setUseAST(!useAST)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {useAST ? 'Switch to Regex' : 'Switch to AST'}
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
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {result.testCase.description}
                </p>
                {/* Pipeline diffs */}
                {result.pipeline && result.pipeline.length > 1 && (
                  <div className="mb-4">
                    <div className="flex flex-col md:flex-row gap-2">
                      {result.pipeline.map((codeSnap, i) => (
                        <div key={i} className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {i === 0
                                ? "Original"
                                : `After L${result.testEnabledLayers[i - 1]}`}
                            </Badge>
                            {i > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {LAYER_LIST.find(l => l.id === result.testEnabledLayers[i - 1])?.name}
                              </span>
                            )}
                          </div>
                          <ScrollArea className="h-28 rounded border bg-muted p-1">
                            <pre className="text-xs whitespace-pre-wrap break-all">
                              <code>{codeSnap}</code>
                            </pre>
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Tabs defaultValue="results">
                  <TabsList>
                    <TabsTrigger value="results">Results</TabsTrigger>
                    <TabsTrigger value="code">Code Diff</TabsTrigger>
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
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
