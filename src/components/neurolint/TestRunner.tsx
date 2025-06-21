import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, TestTube, CheckCircle, XCircle, Clock } from 'lucide-react';
import { NeuroLintOrchestrator } from '@/lib/neurolint/orchestrator';

interface TestCase {
  name: string;
  input: string;
  expected?: string;
}

const TEST_CASES: TestCase[] = [
  {
    name: 'Basic Transformation',
    input: `
      function MyComponent() {
        return <div>Hello, world!</div>;
      }
    `,
    expected: 'MyComponent'
  },
  {
    name: 'Fix Missing Key',
    input: `
      function ItemList({ items }) {
        return (
          <ul>
            {items.map(item => (
              <li>{item.name}</li>
            ))}
          </ul>
        );
      }
    `,
    expected: 'key='
  },
  {
    name: 'Add use client directive',
    input: `
      import { useState } from 'react';
      
      export default function Counter() {
        const [count, setCount] = useState(0);
      
        return (
          <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
          </div>
        );
      }
    `,
    expected: "'use client'"
  },
];

interface TestRunnerProps {
  enabledLayers: number[];
}

export function TestRunner({ enabledLayers }: TestRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const runTests = async () => {
    console.log('Running tests with enabled layers:', enabledLayers);
    setIsRunning(true);
    setTestResults([]);

    const results = [];
    for (const testCase of TEST_CASES) {
      const startTime = Date.now();
      try {
        const result = await NeuroLintOrchestrator(
          testCase.input,
          'test.tsx',
          true, // useAST
          enabledLayers // Pass enabled layers to orchestrator
        );
        
        const processingTime = Date.now() - startTime;
        const passed = testCase.expected ? 
          result.transformed.includes(testCase.expected) : 
          result.transformed !== testCase.input;

        results.push({
          ...testCase,
          passed,
          processingTime,
          output: result.transformed,
          layers: result.layers,
          enabledLayers: [...enabledLayers]
        });
      } catch (error) {
        results.push({
          ...testCase,
          passed: false,
          processingTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          enabledLayers: [...enabledLayers]
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);
    
    const passedCount = results.filter(r => r.passed).length;
    console.log(`Tests completed: ${passedCount}/${results.length} passed with layers [${enabledLayers.join(', ')}]`);
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
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              Run {TEST_CASES.length} test cases to validate NeuroLint transformations with your selected layers.
            </p>
            <Button 
              onClick={runTests}
              disabled={isRunning || enabledLayers.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              {isRunning ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  Running Tests...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Run All Tests
                </div>
              )}
            </Button>
            {enabledLayers.length === 0 && (
              <p className="text-amber-400 text-sm text-center">
                Please enable at least one layer above to run tests.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Test Results</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 text-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Test Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Time (ms)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Layers
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {testResults.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-200">{result.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {result.passed ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="w-4 h-4" />
                          Passed
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500">
                          <XCircle className="w-4 h-4" />
                          Failed
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{result.processingTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {result.enabledLayers.join(', ')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
