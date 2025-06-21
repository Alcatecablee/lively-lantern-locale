
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, TestTube, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestRunnerProps {
  enabledLayers: number[];
}

export function TestRunner({ enabledLayers }: TestRunnerProps) {
  const [testCode, setTestCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleRunTests = async () => {
    if (!testCode.trim()) return;

    console.log('Running tests with enabled layers:', enabledLayers);
    setIsRunning(true);
    setTestResults(null);

    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = {
        passed: Math.floor(Math.random() * 8) + 2,
        failed: Math.floor(Math.random() * 3),
        duration: Math.floor(Math.random() * 1000) + 200,
        tests: [
          { name: 'Component renders correctly', status: 'passed', duration: 45 },
          { name: 'Props are handled properly', status: 'passed', duration: 32 },
          { name: 'Event handlers work', status: 'failed', duration: 78, error: 'Mock error for demo' },
        ]
      };

      setTestResults(mockResults);
      console.log('Test execution completed:', mockResults);
    } catch (error) {
      console.error('Test execution failed:', error);
      setTestResults({
        error: error instanceof Error ? error.message : 'Test execution failed'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TestTube className="w-5 h-5" />
            Test Runner
            <span className="text-sm font-normal text-gray-400">
              (Layers: {enabledLayers.length > 0 ? enabledLayers.join(', ') : 'None'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            placeholder="Paste your test code here..."
            className="min-h-[200px] bg-gray-900/50 border-gray-600 text-white font-mono text-sm"
          />
          <Button 
            onClick={handleRunTests}
            disabled={!testCode.trim() || isRunning || enabledLayers.length === 0}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isRunning ? (
              <div className="flex items-center gap-2">
                <TestTube className="w-4 h-4 animate-pulse" />
                Running Tests...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Run Tests
              </div>
            )}
          </Button>
          {enabledLayers.length === 0 && (
            <p className="text-amber-400 text-sm text-center">
              Please enable at least one layer above to run tests.
            </p>
          )}
        </CardContent>
      </Card>

      {testResults && (
        <Card className="bg-black/30 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TestTube className="w-5 h-5" />
              Test Results
              {testResults.duration && (
                <Badge variant="outline" className="ml-auto">
                  <Clock className="w-3 h-3 mr-1" />
                  {testResults.duration}ms
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.error ? (
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <span>Error: {testResults.error}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {testResults.passed} Passed
                  </Badge>
                  {testResults.failed > 0 && (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      {testResults.failed} Failed
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  {testResults.tests?.map((test: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        {test.status === 'passed' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-white">{test.name}</span>
                        {test.error && (
                          <span className="text-red-400 text-sm">- {test.error}</span>
                        )}
                      </div>
                      <Badge variant="outline">
                        {test.duration}ms
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
