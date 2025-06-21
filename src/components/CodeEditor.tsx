import { useState } from 'react';
import { Play, CheckCircle, AlertTriangle, Info, Zap, Copy, Clipboard } from 'lucide-react';
import { ReactCodeAnalyzer } from '@/utils/analyzer/ReactCodeAnalyzer';
import { CodeIssue } from '@/types/analysis';

const defaultCode = `import { useState } from 'react';

const UserList = ({ users }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('');

  return (
    <div>
      {users.filter(user => user.name.includes(filter)).map(
        (user) => (
          <div
            key={user.name}
            style={{ padding: '10px', margin: '5px' }}
            onClick={() => console.debug('User clicked:', user)}
          >
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        )
      )}
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter users..."
      />
    </div>
  );
};

export default UserList;`;

export const CodeEditor: React.FC = () => {
  const [code, setCode] = useState(defaultCode);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CodeIssue[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('All Issues');
  const [fixedCode, setFixedCode] = useState<string>('');

  const analyzer = new ReactCodeAnalyzer();

  // Real auto-fix logic from useAnalyzer
  const applyAutoFix = (fileName: string, content: string, issue: CodeIssue): string => {
    let fixedContent = content;

    switch (issue.type) {
      case 'console-statements':
        const lines = fixedContent.split('\n');
        if (issue.line && issue.line <= lines.length) {
          const lineIndex = issue.line - 1;
          const line = lines[lineIndex];
          if (line.includes('console.')) {
            if (line.trim().match(/^\s*console\.\w+\([^)]*\);?\s*$/)) {
              lines.splice(lineIndex, 1);
            } else {
              lines[lineIndex] = line.replace(/console\.\w+\([^)]*\);?\s*/g, '');
            }
            fixedContent = lines.join('\n');
          }
        }
        break;

      case 'var-usage':
        fixedContent = fixedContent.replace(/\bvar\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([^;]+);/g, (match, varName, value) => {
          if (value.trim().match(/^[\d"'`true|false|null|undefined]/)) {
            return `const ${varName} = ${value};`;
          }
          return `let ${varName} = ${value};`;
        });
        break;

      case 'missing-key-prop':
        fixedContent = fixedContent.replace(
          /\.map\(([^)]*?)\s*=>\s*\([\s\S]*?<([^>]*?)>/g,
          (match, mapParam, jsxTag) => {
            if (!jsxTag.includes('key=')) {
              const paramName = mapParam.split(',')[0].trim().replace(/[()]/g, '');
              const keyValue = `${paramName}.id || ${paramName}.key || ${paramName}.name`;
              return match.replace(`<${jsxTag}>`, `<${jsxTag} key={${keyValue}}>`);
            }
            return match;
          }
        );
        break;

      case 'missing-prop-types':
        // Add TypeScript interface for props
        if (!fixedContent.includes('interface') && !fixedContent.includes('type')) {
          const componentMatch = fixedContent.match(/const\s+(\w+)\s*=\s*\(\s*\{\s*([^}]+)\s*\}/);
          if (componentMatch) {
            const componentName = componentMatch[1];
            const propsText = componentMatch[2];
            const props = propsText.split(',').map(p => p.trim());
            const interfaceProps = props.map(prop => `  ${prop}: unknown;`).join('\n');
            const interfaceDecl = `interface ${componentName}Props {\n${interfaceProps}\n}\n\n`;
            fixedContent = fixedContent.replace(componentMatch[0], 
              `${interfaceDecl}const ${componentName}: React.FC<${componentName}Props> = ({ ${propsText} })`);
          }
        }
        break;

      case 'inline-style-object':
        fixedContent = fixedContent.replace(
          /style=\{\{([^}]+)\}\}/g,
          (match, styleContent) => {
            const styleName = 'elementStyles';
            const styleDeclaration = `  const ${styleName} = {${styleContent}};`;
            const componentMatch = fixedContent.match(/(const\s+\w+[^=]*=\s*[^=]*=>\s*\{)/);
            if (componentMatch) {
              fixedContent = fixedContent.replace(componentMatch[1], `${componentMatch[1]}\n${styleDeclaration}`);
            }
            return `style={${styleName}}`;
          }
        );
        break;

      case 'semantic-html':
        fixedContent = fixedContent.replace(
          /<div([^>]*?)onClick/g,
          '<button aria-label="Button"$1onClick'
        ).replace(
          /<\/div>/g,
          (match, offset) => {
            const beforeDiv = fixedContent.substring(0, offset);
            const openButtonTags = (beforeDiv.match(/<button aria-label="Button"/g) || []).length;
            const closeButtonTags = (beforeDiv.match(/<\/button>/g) || []).length;
            if (openButtonTags > closeButtonTags) {
              return '</button>';
            }
            return match;
          }
        );
        break;

      default:
        console.debug(`Auto-fix not implemented for issue type: ${issue.type}`);
    }

    return fixedContent;
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setShowResults(false);

    try {
      // Real analysis using ReactCodeAnalyzer
      const result = await analyzer.analyzeFile('component.tsx', code);
      setAnalysis(result.issues);
      setShowResults(true);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis([]);
      setShowResults(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFixAll = () => {
    let currentCode = code;
    const autoFixableIssues = analysis.filter(issue => issue.autoFixable);

    autoFixableIssues.forEach(issue => {
      currentCode = applyAutoFix('component.tsx', currentCode, issue);
    });

    setFixedCode(currentCode);
    setCode(currentCode);

    // Re-analyze after fixes
    setTimeout(() => {
      handleAnalyze();
    }, 500);
  };

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setCode(text);
        setShowResults(false);
        setAnalysis([]);
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  };

  const getIssueIcon = (type: CodeIssue['severity']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getIssuesByCategory = (category: string) => {
    if (category === 'All Issues') return analysis;

    const categoryMap: Record<string, string[]> = {
      'Performance Issues': ['unnecessary-rerender', 'heavy-computation-render', 'inline-style-object', 'inline-function-prop'],
      'Accessibility Problems': ['missing-alt-text', 'missing-aria-label', 'semantic-html'],
      'Best Practice Violations': ['missing-prop-types', 'console-statements', 'var-usage', 'missing-key-prop', 'component-naming']
    };

    return analysis.filter(issue => categoryMap[category]?.includes(issue.type) || false);
  };

  const tabs = ['All Issues', 'Performance Issues', 'Accessibility Problems', 'Best Practice Violations'];
  const currentIssues = getIssuesByCategory(activeTab);

  const highlightCode = (codeText: string) => {
    return codeText
      .replace(/\b(import|from|const|return|onClick|style|key|export|default)\b/g, '<span style="color: #8b5cf6">$&</span>')
      .replace(/\b(React|useState|useEffect)\b/g, '<span style="color: #3b82f6">$&</span>')
      .replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '<span style="color: #10b981">$&</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #f59e0b">$&</span>');
  };

  return (
    <div className="grid grid-cols-2 gap-6 h-[600px]">
      {/* Code Editor Panel */}
      <div className="card-cursor p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-cursor-border">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 text-cursor-text-primary font-medium">React Code Editor</span>
          </div>
          <button aria-label="Button"
            onClick={handlePasteCode}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-cursor-surface hover:bg-cursor-card rounded border border-cursor-border transition-colors"
          >
            <Clipboard className="h-3 w-3" />
            <span>Paste</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-4 pb-0">
          {tabs.map((tab) => (
            <button aria-label="Button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-cursor-accent-blue text-white'
                  : 'text-cursor-text-secondary hover:text-cursor-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Code Area */}
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 flex">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm bg-transparent text-cursor-text-primary resize-none border-none outline-none"
              style={{ fontFamily: "'JetBrains Mono', monospace", lineHeight: '1.5' }}
              placeholder="Paste your React code here..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-cursor-border flex space-x-2">
          <button aria-label="Button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn-cursor-primary flex-1 py-2.5 font-semibold disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Analyze Code
              </>
            )}
          </button>

          {analysis.filter(i => i.autoFixable).length > 0 && (
            <button aria-label="Button"
              onClick={handleFixAll}
              className="btn-cursor-secondary px-4 py-2.5 font-semibold"
            >
              Fix All ({analysis.filter(i => i.autoFixable).length})
            </button>
          )}
        </div>
      </div>

      {/* Analysis Results Panel */}
      <div className="card-cursor p-0 overflow-hidden">
        <div className="flex items-center space-x-2 p-4 border-b border-cursor-border">
          <CheckCircle className="h-5 w-5 text-cursor-accent-green" />
          <span className="text-cursor-text-primary font-medium">
            Analysis Results {analysis.length > 0 && `(${analysis.length} issues)`}
          </span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {!showResults ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 rounded-full bg-cursor-surface border-2 border-cursor-border flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-cursor-text-muted" />
              </div>
              <p className="text-cursor-text-secondary mb-2">
                Click "Analyze Code" to see results
              </p>
              <p className="text-xs text-cursor-text-muted">
                Or paste your own React code to analyze
              </p>
            </div>
          ) : analysis.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 rounded-full bg-cursor-accent-green/10 border-2 border-cursor-accent-green/20 flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-cursor-accent-green" />
              </div>
              <p className="text-cursor-text-primary font-medium mb-2">
                Great code! No issues found.
              </p>
              <p className="text-xs text-cursor-text-muted">
                Your React code follows best practices
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-cursor-text-secondary mb-4">
                Found {currentIssues.length} issues {activeTab !== 'All Issues' && `in ${activeTab}`}
              </div>

              {currentIssues.map((issue, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-cursor-surface rounded-lg border border-cursor-border">
                  {getIssueIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-cursor-text-muted">
                        {issue.line ? `Line ${issue.line}` : 'General'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        issue.severity === 'error' ? 'bg-red-500/20 text-red-400' :
                        issue.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {issue.severity}
                      </span>
                      {issue.autoFixable && (
                        <span className="text-xs px-2 py-0.5 rounded bg-cursor-accent-green/20 text-cursor-accent-green">
                          Auto-fixable
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-cursor-text-primary mb-1">{issue.message}</p>
                    {issue.suggestion && (
                      <p className="text-xs text-cursor-text-muted">{issue.suggestion}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 