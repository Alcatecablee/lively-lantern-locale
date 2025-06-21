import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { EducationalButton } from '@/components/education';
import { EducationService } from '@/lib/education';
import { getSampleEducationalContent } from '@/lib/sampleEducationalContent';
import { CodeIssue } from '@/types/analysis';
// Test issues to verify educational content
const testIssues: CodeIssue[] = [
  {
    id: 'test-1',
    type: 'unused-variable',
    severity: 'warning',
    message: 'Variable "unusedVar" is declared but never used',
    line: 3,
    column: 8,
    file: 'test.js',
    fixable: true,
    autoFixable: true,
    layer: 3,
    suggestion: 'Remove the unused variable'
  },
  {
    id: 'test-2',
    type: 'missing-key-prop',
    severity: 'error',
    message: 'Missing "key" prop for element in iterator',
    line: 8,
    column: 12,
    file: 'test.jsx',
    fixable: true,
    autoFixable: false,
    layer: 2,
    suggestion: 'Add unique key prop'
  },
  {
    id: 'test-3',
    type: 'inefficient-re-render',
    severity: 'warning',
    message: 'Expensive calculation without memoization',
    line: 15,
    column: 20,
    file: 'test.jsx',
    fixable: true,
    autoFixable: false,
    layer: 2,
    suggestion: 'Use useMemo to optimize'
  }
];
interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
}
export const EducationalSystemTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];
    // Test 1: Sample educational content availability
    try {
      const unusedVarContent = getSampleEducationalContent('unused-variable');
      const keyPropContent = getSampleEducationalContent('missing-key-prop');
      const rerenderContent = getSampleEducationalContent('inefficient-re-render');
      if (unusedVarContent && keyPropContent && rerenderContent) {
        results.push({
          name: 'Sample Educational Content',
          status: 'pass',
          message: 'All sample educational modules loaded successfully'
        });
      } else {
        results.push({
          name: 'Sample Educational Content',
          status: 'fail',
          message: 'Some sample educational modules missing'
        });
      }
    } catch (error) {
      results.push({
        name: 'Sample Educational Content',
        status: 'fail',
        message: `Error loading sample content: ${error}`
      });
    }
    // Test 2: Educational service functionality
    try {
      const isAvailable = await EducationService.isEducationalSystemAvailable();
      results.push({
        name: 'Educational Service',
        status: isAvailable ? 'pass' : 'fail',
        message: isAvailable ? 'Educational service is available' : 'Educational service unavailable'
      });
    } catch (error) {
      results.push({
        name: 'Educational Service',
        status: 'fail',
        message: `Educational service error: ${error}`
      });
    }
    // Test 3: Educational content for each test issue
    for (const issue of testIssues) {
      try {
        const content = await EducationService.getEducationalContentForIssue(issue.type);
        results.push({
          name: `Content for ${issue.type}`,
          status: content.hasContent ? 'pass' : 'fail',
          message: content.hasContent ? 'Educational content available' : 'No educational content found'
        });
      } catch (error) {
        results.push({
          name: `Content for ${issue.type}`,
          status: 'fail',
          message: `Error: ${error}`
        });
      }
    }
    setTestResults(results);
    setIsRunning(false);
  };
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'border-green-200 bg-green-50';
      case 'fail':
        return 'border-red-200 bg-red-50';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
    }
  };
  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const totalTests = testResults.length;
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Educational System Test Suite</CardTitle>
        <CardDescription>
          Verify that all educational features are working properly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="flex items-center justify-between">
          <Button variant="default" onClick={runTests} 
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          {testResults.length > 0 && (
            <Badge 
              variant={passedTests === totalTests ? 'default' : 'destructive'}
              className="text-sm"
            >
              {passedTests}/{totalTests} Tests Passed
            </Badge>
          )}
        </div>
        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h4 className="font-medium">{result.name}</h4>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Sample Educational Buttons */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Interactive Test - Try the Educational Buttons</h3>
          <p className="text-sm text-gray-600 mb-4">
            Click the "Learn" buttons below to test the full educational experience:
          </p>
          <div className="space-y-4">
            {testIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{issue.message}</h4>
                    <p className="text-sm text-gray-600">{issue.suggestion}</p>
                    <Badge variant="outline" className="mt-1">
                      {issue.type}
                    </Badge>
                  </div>
                  <EducationalButton issue={issue} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Manual Testing Checklist */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Manual Testing Checklist</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2 text-sm">
              <li>✅ Click "Learn" buttons to open educational overlays</li>
              <li>✅ Navigate between Learn/Practice/Quiz tabs</li>
              <li>✅ Complete a quiz and verify scoring works</li>
              <li>✅ Check that progress is tracked and persists</li>
              <li>✅ Verify before/after code examples display correctly</li>
              <li>✅ Test quiz feedback and explanations</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 