
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Zap } from 'lucide-react';
import { NeuroLintEnhancedOrchestrator } from '@/lib/neurolint/orchestrator-enhanced';
import { TEST_CASES, validateTestResult, TestResult } from '@/lib/neurolint/testSuite';
import { TestConfiguration } from './TestConfiguration';
import { TestResultCard } from './TestResultCard';
import { TestProgress } from './TestProgress';

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
              AST-Only Mode
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TestConfiguration
              useAST={useAST}
              setUseAST={setUseAST}
              enableConflictDetection={enableConflictDetection}
              setEnableConflictDetection={setEnableConflictDetection}
              enableSemanticAnalysis={enableSemanticAnalysis}
              setEnableSemanticAnalysis={setEnableSemanticAnalysis}
            />

            <div className="flex items-center gap-4">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                {isRunning ? 'Running AST Tests...' : 'Run All Tests'}
              </Button>
              
              {results.length > 0 && (
                <div className="flex items-center gap-4">
                  <Badge variant={passRate === 100 ? "default" : passRate > 50 ? "secondary" : "destructive"}>
                    {passedTests}/{totalTests} Passed ({passRate.toFixed(1)}%)
                  </Badge>
                </div>
              )}
            </div>

            <TestProgress
              isRunning={isRunning}
              currentTest={currentTest}
              progress={progress}
            />
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((result, index) => (
            <TestResultCard key={index} result={result} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
