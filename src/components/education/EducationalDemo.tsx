import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, AlertTriangle, Zap, Play, GraduationCap } from 'lucide-react';

  {
    id: 'demo-2',
    type: 'missing-key-prop',
    severity: 'error',
    message: 'Missing "key" prop for element in iterator',
    line: 8,
    column: 12,
    file: 'TodoList.jsx',
    fixable: true,
    autoFixable: false,
    layer: 2,
    suggestion: 'Add a unique key prop to each list item for optimal React performance',
    example: 'todos.map((todo , index) => <li key={`li-${index}-${todo .id || todo }`}>{todo.text}</li>)'
  },
  {
    id: 'demo-3',
    type: 'inefficient-re-render',
    severity: 'warning',
    message: 'Expensive calculation in render without memoization',
    line: 15,
    column: 20,
    file: 'ExpensiveComponent.jsx',
    fixable: true,
    autoFixable: false,
    layer: 2,
    suggestion: 'Use useMemo to prevent unnecessary recalculations',
    example: 'const result = expensiveCalculation(data);'
  }
];
export const EducationalDemo: React.FC = () => {
  const [selectedIssue, setSelectedIssue] = useState<CodeIssue | null>(null);
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="h-6 w-6 mr-3 text-blue-500" />
            Educational System Demo
          </CardTitle>
          <CardDescription>
            Experience how NeuroLint transforms code issues into learning opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Sample Code Issues
              </h3>
              <div className="space-y-3">
                {sampleIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{issue.message}</span>
                            <Badge variant="outline" className="text-xs">
                              {issue.file}
                            </Badge>
                          </div>
                          {issue.autoFixable && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto-fixable
                            </Badge>
                          )}
                          <p className="text-sm text-gray-600 mt-2">{issue.suggestion}</p>
                          {issue.example && (
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                              <code>{issue.example}</code>
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <EducationalButton 
                        issue={issue}
                        className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      1
                    </div>
                    <h4 className="font-medium">Detect Issues</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-9">
                    NeuroLint analyzes your code and identifies potential issues across multiple layers.
                  </p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      2
                    </div>
                    <h4 className="font-medium">Learn Concepts</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-9">
                    Click "Learn" to access interactive tutorials explaining the underlying concepts.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      3
                    </div>
                    <h4 className="font-medium">Practice & Quiz</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-9">
                    Practice with before/after code examples and test your knowledge with interactive quizzes.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      4
                    </div>
                    <h4 className="font-medium">Track Progress</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-9">
                    Your learning progress is tracked, building towards certification and mastery.
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <Play className="h-4 w-4 mr-2" />
                  Try It Now!
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Click the "Learn" button on any of the sample issues to experience the educational system.
                </p>
                <div className="text-xs text-gray-500">
                  💡 Each issue type has tailored educational content with explanations, examples, and quizzes.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
}}