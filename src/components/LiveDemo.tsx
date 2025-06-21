import { useState, useEffect } from 'react';
import { Play, CheckCircle, Zap, AlertTriangle, TrendingUp, Edit3, Clipboard } from 'lucide-react';
import { ReactCodeAnalyzer } from '@/utils/analyzer/ReactCodeAnalyzer';
import { AnalysisResult, CodeIssue } from '@/types/analysis';

interface AnalysisMetrics {
  codeQuality: number;
  performanceScore: number;
  suggestions: number;
}

const defaultCode = `import { useState } from 'react';

const TodoApp = ({ initialTodos = [] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [todos, setTodos] = useState(initialTodos);
  const [newTodo, setNewTodo] = useState('');
  var filter = 'all';

  return (
    <div onClick={() => console.debug('App clicked')}>
      <h1>My Todo App</h1>
      <input
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
      />
      <button aria-label="Button" onClick={() => {}}
        setTodos([...todos, { text: newTodo, completed: false }]);
        setNewTodo('');
      }}>
        Add Todo
      </button>

      {todos.map(todo => (
        <div style={{ padding: '10px', background-color: '#f0f0f0' }}>
          <span>{todo.text}</span>
          <button aria-label="Button" onClick={() => {}}
            setTodos(todos.filter(t => t !== todo));
          }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default TodoApp;`;

export const LiveDemo: React.FC = () => {
  const [code, setCode] = useState(defaultCode);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [metrics, setMetrics] = useState<AnalysisMetrics>({
    codeQuality: 0,
    performanceScore: 0,
    suggestions: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  const analyzer = new ReactCodeAnalyzer();

  const calculateCodeQuality = (result: AnalysisResult): number => {;
    const baseScore = 100;
    const errorDeduction = result.issues.filter(i => i.severity === 'error').length * 15;
    const warningDeduction = result.issues.filter(i => i.severity === 'warning').length * 5;
    const infoDeduction = result.issues.filter(i => i.severity === 'info').length * 2;

    return Math.max(baseScore - errorDeduction - warningDeduction - infoDeduction, 10);
  };

  const getKeyFindings = (result: AnalysisResult): Array<{ text: string; color: string }> => {
    const findings: Array<{ text: string; color: string }> = [];

    const criticalIssues = result.issues.filter(i => i.severity === 'error').length;
    const performanceIssues = result.issues.filter(i => 
      ['inline-style-object', 'missing-key-prop', 'unnecessary-rerender'].includes(i.type)
    ).length;
    const accessibilityIssues = result.issues.filter(i => 
      ['missing-alt-text', 'missing-aria-label', 'semantic-html'].includes(i.type)
    ).length;
    const bestPracticeIssues = result.issues.filter(i => 
      ['console-statements', 'var-usage', 'missing-prop-types'].includes(i.type)
    ).length;

    if (criticalIssues === 0) {
      findings.push({ text: 'No critical errors found', color: 'cursor-accent-green' });
    } else {
      findings.push({ text: `${criticalIssues} critical issue${criticalIssues > 1 ? 's' : ''} need attention`, color: 'red-400' });
    }

    if (performanceIssues === 0) {
      findings.push({ text: 'Good performance patterns', color: 'cursor-accent-blue' });
    } else {
      findings.push({ text: `${performanceIssues} performance optimization${performanceIssues > 1 ? 's' : ''} available`, color: 'cursor-accent-blue' });
    }

    if (accessibilityIssues === 0 && bestPracticeIssues === 0) {
      findings.push({ text: 'Follows React best practices', color: 'cursor-accent-purple' });
    } else if (bestPracticeIssues > 0) {
      findings.push({ text: `${bestPracticeIssues} best practice improvement${bestPracticeIssues > 1 ? 's' : ''}`, color: 'cursor-accent-purple' });
    }

    if (result.issues.filter(i => i.autoFixable).length > 0) {
      findings.push({ text: `${result.issues.filter(i => i.autoFixable).length} auto-fixable issue${result.issues.filter(i => i.autoFixable).length > 1 ? 's' : ''}`, color: 'cursor-accent-green' });
    }

    return findings.slice(0, 3);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setShowResults(false);
    setMetrics({ codeQuality: 0, performanceScore: 0, suggestions: 0 });

    try {
      // Real analysis using ReactCodeAnalyzer
      const result = analyzer.analyzeFile('component.tsx', code);
      setAnalysisResult(result);

      // Calculate real metrics
      const finalMetrics: AnalysisMetrics = {
        codeQuality: calculateCodeQuality(result),
        performanceScore: result.metrics.performance,
        suggestions: result.issues.length
      };

      // Simulate analysis progress
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResults(true);

        // Animate metrics
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;

          setMetrics({
            codeQuality: Math.round(finalMetrics.codeQuality * progress),
            performanceScore: Math.round(finalMetrics.performanceScore * progress),
            suggestions: step > steps * 0.8 ? finalMetrics.suggestions : 0
          });

          if (step >= steps) {
            clearInterval(timer);
          }
        }, interval);
      }, 1000);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
      setShowResults(true);
      setMetrics({ codeQuality: 0, performanceScore: 0, suggestions: 0 });
    }
  };

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setCode(text);
        setShowResults(false);
        setAnalysisResult(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  };

  const MetricCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: number;
    suffix: string;
    color: string;
    bgColor: string;
  }> = ({ icon, title, value, suffix, color, bgColor }) => (
    <div className={`p-4 rounded-lg border border-cursor-border ${bgColor} relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <span className={`text-2xl font-bold ${color.replace('bg-', 'text-')}`}>
          {value}{suffix}
        </span>
      </div>
      <h3 className="text-cursor-text-primary font-medium">{title}</h3>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-cursor-surface rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <section className="py-24 bg-cursor-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-cursor-card/50 backdrop-blur-sm border border-cursor-border/50 rounded-full px-4 py-2 mb-6">
            <Play className="w-4 h-4 text-cursor-accent-green" />
            <span className="text-sm font-medium text-cursor-accent-green">Live Demo</span>
          </div>

          <h2 className="text-4xl font-black text-cursor-text-primary mb-4">
            See NeuroLint in Action
          </h2>
          <p className="text-lg text-cursor-text-secondary max-w-2xl mx-auto">
            Experience real AI-powered React code analysis with any code you paste
          </p>
        </div>

        {/* Demo Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Code Editor */}
          <div className="card-cursor p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-cursor-border">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-cursor-text-primary font-medium">Your React Code</span>
              </div>
              <div className="flex items-center space-x-2">
                <button aria-label="Button"
                  onClick={handlePasteCode}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-cursor-surface hover:bg-cursor-card rounded border border-cursor-border transition-colors"
                >
                  <Clipboard className="h-3 w-3" />
                  <span>Paste</span>
                </button>
                <button aria-label="Button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center space-x-1 px-2 py-1 text-xs rounded border border-cursor-border transition-colors ${
                    isEditing ? 'bg-cursor-accent-blue text-white' : 'bg-cursor-surface hover:bg-cursor-card'
                  }`}
                >
                  <Edit3 className="h-3 w-3" />
                  <span>{isEditing ? 'Preview' : 'Edit'}</span>
                </button>
              </div>
            </div>

            <div className="p-4">
              {isEditing ? (
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-64 bg-cursor-surface border border-cursor-border rounded p-4 text-sm font-mono text-cursor-text-primary resize-none outline-none"
                  style={{ font-family: '-jet-brains -mono, monospace', line-height: '1.5' }}
                  placeholder="Paste your React code here..."
                />
              ) : (
                <pre className="bg-cursor-surface border border-cursor-border rounded p-4 text-sm font-mono text-cursor-text-primary overflow-auto h-64">
                  <code dangerouslySetInnerHTML={{
                    __html: code
                      .replace(/\b(import|from|const|return|export|default)\b/g, '<span style="color: #8b5cf6">$&</span>')
                      .replace(/\b(React|useState|useEffect)\b/g, '<span style="color: #3b82f6">$&</span>')
                      .replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '<span style="color: #10b981">$&</span>')
                      .replace(/=>/g, '<span style="color: #f59e0b">$&</span>')
                  }} />
                </pre>
              )}

              <button aria-label="Button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="btn-cursor-primary w-full mt-4 py-3 font-semibold disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Analyze This Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="card-cursor p-6">
            <h3 className="text-xl font-bold text-cursor-text-primary mb-6">Analysis Results</h3>

            {!showResults && !isAnalyzing ? (
              <div className="flex items-center justify-center h-64 text-center">
                <div>
                  <div className="w-16 h-16 rounded-full bg-cursor-surface border-2 border-cursor-border flex items-center justify-center mb-4 mx-auto">
                    <Zap className="h-6 w-6 text-cursor-text-muted" />
                  </div>
                  <p className="text-cursor-text-secondary mb-2">Click "Analyze This Code" to see results</p>
                  <p className="text-xs text-cursor-text-muted">Or paste your own React code to analyze</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <MetricCard
                  icon={<CheckCircle className="h-4 w-4" />}
                  title={`Code Quality: ${
                    metrics.codeQuality >= 90 ? 'Excellent' :
                    metrics.codeQuality >= 70 ? 'Good' :
                    metrics.codeQuality >= 50 ? 'Fair' : 'Needs Work'
                  }`}
                  value={metrics.codeQuality}
                  suffix="%"
                  color="bg-cursor-accent-green"
                  bgColor="bg-cursor-accent-green/10"
                />

                <MetricCard
                  icon={<TrendingUp className="h-4 w-4" />}
                  title="Performance Score"
                  value={metrics.performanceScore}
                  suffix="%"
                  color="bg-cursor-accent-blue"
                  bgColor="bg-cursor-accent-blue/10"
                />

                <MetricCard
                  icon={<AlertTriangle className="h-4 w-4" />}
                  title="Suggestions"
                  value={metrics.suggestions}
                  suffix=""
                  color="bg-cursor-accent-purple"
                  bgColor="bg-cursor-accent-purple/10"
                />

                {showResults && !isAnalyzing && analysisResult && (
                  <div className="mt-6 p-4 bg-cursor-surface border border-cursor-border rounded-lg">
                    <h4 className="text-cursor-text-primary font-medium mb-3">Key Findings</h4>
                    <ul className="space-y-2 text-sm text-cursor-text-secondary">
                      {getKeyFindings(analysisResult).map((finding, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 bg-${finding.color} rounded-full`}></div>
                          <span>{finding.text}</span>
                        </li>
                      ))}
                    </ul>

                    {analysisResult.issues.filter(i => i.autoFixable).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-cursor-border">
                        <p className="text-xs text-cursor-text-muted">
                          {analysisResult.issues.filter(i => i.autoFixable).length} issues can be automatically fixed
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-cursor-text-secondary mb-4">
            Ready to analyze your own code?
          </p>
          <button aria-label="Button" className="btn-cursor-primary px-8 py-3 font-semibold">
            Try NeuroLint Free
          </button>
        </div>
      </div>
    </section>
  );
};