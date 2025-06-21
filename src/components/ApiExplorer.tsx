import { useState } from 'react';
import { Play, Copy, Check, AlertTriangle } from 'lucide-react';
import { ReactCodeAnalyzer } from '@/utils/analyzer/ReactCodeAnalyzer';
import { AnalysisResult } from '@/types/analysis';

const defaultRequest = {
  item_text: `import { useState } from 'react';

const MyComponent = ({ title, items }) => {
  const [count, setCount] = useState(0);
  var filter = '';

  return (
    <div onClick={() => console.debug('clicked')}>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      {items.map(item => (
        <div style={{ padding: 10 }}>
          {item.name}
        </div>
      ))}
      <button aria-label="Button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};

export default MyComponent;`,
  options: {
    layers: ["consciousness", "temporal", "semantic"],
    autofix: true,
    format: "detailed"
  }
};

interface ApiAnalysisResponse {
  consciousness: {
    awareness_level: number;
    intent: string;
    emotional_context: string;
    functional: string;
  };
  temporal: {
    evolution_score: number;
    change_velocity: string;
    sustainability: string;
  };
  analysis: {
    total_issues: number;
    critical_issues: number;
    performance_score: number;
    issues: Array<{
      type: string;
      severity: string;
      message: string;
      line?: number;
      autoFixable: boolean;
    }>;
  };
  metrics: {
    complexity: number;
    maintainability: number;
    performance: number;
  };
}

export const ApiExplorer: React.FC = () => {
  const [requestBody, setRequestBody] = useState(JSON.stringify(defaultRequest, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiAnalysisResponse | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [copied, setCopied] = useState(false);
  const [responseTime, setResponseTime] = useState(0);

  const analyzer = new ReactCodeAnalyzer();

  const calculateConsciousnessScore = (result: AnalysisResult): number => {
    const baseScore = 60;
    const issueDeduction = result.issues.length * 2;
    const criticalDeduction = result.issues.filter(i => i.severity === 'error').length * 5;
    return Math.max(baseScore - issueDeduction - criticalDeduction, 10);
  };

  const calculateEvolutionScore = (result: AnalysisResult): number => {
    const modernPatterns = result.issues.filter(i => 
      ['class-component', 'deprecated-find-dom-node', 'string-refs'].includes(i.type)
    ).length;
    return Math.max(5 - modernPatterns, 1);
  };

  const getIntent = (result: AnalysisResult): string => {
    const criticalIssues = result.issues.filter(i => i.severity === 'error').length;
    if (criticalIssues === 0) return 'pragmatic';
    if (criticalIssues <= 2) return 'cautious';
    return 'experimental';
  };

  const getChangeVelocity = (result: AnalysisResult): string => {
    const autoFixableCount = result.issues.filter(i => i.autoFixable).length;
    if (autoFixableCount >= result.issues.length * 0.8) return 'sustainable';
    if (autoFixableCount >= result.issues.length * 0.5) return 'moderate';
    return 'complex';
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const requestData = JSON.parse(requestBody);
      const code = requestData.item_text;

      // Real analysis using ReactCodeAnalyzer
      const result = analyzer.analyzeFile('component.tsx', code);
      const endTime = Date.now();
      setResponseTime(endTime - startTime);

      // Create response in NeuroLint format
      const apiResponse: ApiAnalysisResponse = {
        consciousness: {
          awareness_level: calculateConsciousnessScore(result),
          intent: getIntent(result),
          emotional_context: result.issues.length === 0 ? 'confident' : 'analytical',
          functional: result.issues.filter(i => i.severity === 'error').length === 0 ? 'functional' : 'needs_attention'
        },
        temporal: {
          evolution_score: calculateEvolutionScore(result),
          change_velocity: getChangeVelocity(result),
          sustainability: result.metrics.maintainability > 80 ? 'stable' : 'evolving'
        },
        analysis: {
          total_issues: result.issues.length,
          critical_issues: result.issues.filter(i => i.severity === 'error').length,
          performance_score: result.metrics.performance,
          issues: result.issues.slice(0, 5).map(issue => ({
            type: issue.type,
            severity: issue.severity,
            message: issue.message,
            line: issue.line,
            autoFixable: issue.autoFixable
          }))
        },
        metrics: result.metrics
      };

      setResponse(apiResponse);
      setShowResponse(true);
    } catch (error) {
      console.error('Analysis failed:', error);
      setResponse(null);
      setShowResponse(true);
      setResponseTime(Date.now() - startTime);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const syntaxHighlight = (json: string) => {
    return json
      .replace(/"([^"]+)":/g, '<span style="color: #3b82f6">"$1":</span>')
      .replace(/: "([^"]+)"/g, ': <span style="color: #10b981">"$1"</span>')
      .replace(/: (\d+\.?\d*)/g, ': <span style="color: #f59e0b">$1</span>')
      .replace(/: (true|false)/g, ': <span style="color: #8b5cf6">$1</span>');
  };

  return (
    <div className="grid grid-cols-2 gap-6 h-[600px]">
      {/* API Explorer Panel */}
      <div className="card-cursor p-0 overflow-hidden">
        <div className="p-4 border-b border-cursor-border">
          <h3 className="text-cursor-text-primary font-semibold">NeuroLint API Explorer</h3>
          <p className="text-xs text-cursor-text-secondary mt-1">Test real React code analysis</p>
        </div>

        {/* Method and Endpoint */}
        <div className="p-4 border-b border-cursor-border">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-cursor-accent-green text-white text-sm font-semibold rounded">
              POST
            </span>
            <code className="text-cursor-text-primary bg-cursor-surface px-3 py-1 rounded text-sm">
              /api/v1/analyze
            </code>
          </div>
        </div>

        {/* Headers */}
        <div className="p-4 border-b border-cursor-border">
          <h4 className="text-cursor-text-primary font-medium mb-3">Headers</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-cursor-surface rounded text-sm">
              <span className="text-cursor-accent-blue">Authorization:</span>
              <span className="text-cursor-text-secondary">Bearer your_api_key</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-cursor-surface rounded text-sm">
              <span className="text-cursor-accent-blue">Content-Type:</span>
              <span className="text-cursor-text-secondary">application/json</span>
            </div>
          </div>
        </div>

        {/* Request Body */}
        <div className="flex-1 p-4">
          <h4 className="text-cursor-text-primary font-medium mb-3">Request Body</h4>
          <div className="relative">
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="w-full h-48 bg-cursor-surface border border-cursor-border rounded p-4 text-sm font-mono text-cursor-text-primary resize-none outline-none"
              placeholder="Edit your request JSON..."
            />
          </div>
        </div>

        {/* Send Button */}
        <div className="p-4 border-t border-cursor-border">
          <button
            onClick={handleSendRequest}
            disabled={isLoading}
            className="btn-cursor-primary w-full py-3 font-semibold disabled:opacity-50"
           aria-label="Button">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Analyzing Code...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Send Request
              </>
            )}
          </button>
        </div>
      </div>

      {/* Response Panel */}
      <div className="card-cursor p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-cursor-border">
          <h3 className="text-cursor-text-primary font-semibold">Response</h3>
          {showResponse && (
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-cursor-accent-green text-white text-xs font-semibold rounded">
                200 OK
              </span>
              <button aria-label="Button"
                onClick={() => response && copyToClipboard(JSON.stringify(response, null, 2))}
                className="p-1.5 hover:bg-cursor-surface rounded transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-cursor-accent-green" />
                ) : (
                  <Copy className="h-4 w-4 text-cursor-text-secondary" />
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {!showResponse ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-cursor-surface border-2 border-cursor-border flex items-center justify-center mb-4 mx-auto">
                  <Play className="h-6 w-6 text-cursor-text-muted" />
                </div>
                <p className="text-cursor-text-secondary">Send a request to see the response</p>
                <p className="text-xs text-cursor-text-muted mt-1">Real analysis results will appear here</p>
              </div>
            </div>
          ) : !response ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center mb-4 mx-auto">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <p className="text-red-400 font-medium">Analysis failed</p>
                <p className="text-xs text-cursor-text-muted mt-1">Check your request format</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Response Status */}
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-cursor-text-secondary">Status:</span>
                <span className="text-cursor-accent-green font-semibold">200 OK</span>
                <span className="text-cursor-text-muted">•</span>
                <span className="text-cursor-text-secondary">Time: {responseTime}ms</span>
              </div>

              {/* Response Body */}
              <div>
                <h4 className="text-cursor-text-primary font-medium mb-3">Response Body</h4>
                <pre className="bg-cursor-surface border border-cursor-border rounded p-4 text-sm font-mono text-cursor-text-primary overflow-auto max-h-96">
                  <code dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(JSON.stringify(response, null, 2))
                  }} />
                </pre>
              </div>

              {/* Response Headers */}
              <div>
                <h4 className="text-cursor-text-primary font-medium mb-3">Response Headers</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between p-2 bg-cursor-surface rounded">
                    <span className="text-cursor-accent-blue">content-type:</span>
                    <span className="text-cursor-text-secondary">application/json</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cursor-surface rounded">
                    <span className="text-cursor-accent-blue">x-analysis-version:</span>
                    <span className="text-cursor-text-secondary">v2.1.0</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cursor-surface rounded">
                    <span className="text-cursor-accent-blue">x-response-time:</span>
                    <span className="text-cursor-text-secondary">{responseTime}ms</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cursor-surface rounded">
                    <span className="text-cursor-accent-blue">x-issues-found:</span>
                    <span className="text-cursor-text-secondary">{response.analysis.total_issues}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 