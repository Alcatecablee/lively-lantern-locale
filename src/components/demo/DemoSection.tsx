import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Play, Code, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { DemoCodeEditor } from './DemoCodeEditor';
import { DemoAnalysisResults } from './DemoAnalysisResults';
import { ReactCodeAnalyzer } from '@/utils/analyzer/ReactCodeAnalyzer';
import { ProjectAnalysis, CodeIssue } from '@/types/analysis';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const demoExamples = {
  'performance': {
    title: 'Performance Issues',
    description: 'Component with unnecessary re-renders and inline objects',
    code: `import { useState } from 'react';

const UserList = ({ users }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('');

  return (
    <div>
      {users.filter(user => user.name.includes(filter)).map(user => (
        <div 
          key={user.name} 
          style={{ padding: '10px', margin: '5px' }}
          onClick={() => console.debug('User clicked:', user)}
        >
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
      <input 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter users..."
      />
    </div>
  );
};

export default UserList;`
  },
  'accessibility': {
    title: 'Accessibility Problems',
    description: 'Missing ARIA labels and alt text',
    code: `import React from 'react';

const ImageGallery = ({ images }) => {
  return (
    <div>
      <h2>Photo Gallery</h2>
      {images.map((image, index) => (
        <div key={index}>
          <img src={image.url} />
          <div onClick={() => alert('Image liked!')}>
            👍 Like
          </div>
        </div>
      ))}
      <div onClick={() => window.location.href = '/upload'}>
        Add New Photo
      </div>
    </div>
  );
};

export default ImageGallery;`
  },
  'best-practices': {
    title: 'Best Practice Violations',
    description: 'var usage, missing keys, and other violations',
    code: `import { useEffect } from 'react';

function TodoList() {
  var todos = [
    { text: 'Buy groceries' },
    { text: 'Walk the dog' },
    { text: 'Write code' }
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    console.debug('Component mounted');
    fetchTodos();
  });

  const fetchTodos = () => {
    // Fetch logic here
  };

  return (
    <div>
      <h1>My Todos</h1>
      {todos.map(todo => (
        <div>
          <span>{todo.text}</span>
          <button aria-label="Button" onClick={() => deleteTodo(todo)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default TodoList;`
  }
};

export const DemoSection: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<keyof typeof demoExamples>('performance');
  const [code, setCode] = useState(demoExamples.performance.code);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoUsageCount, setDemoUsageCount] = useState(0);
  const [fixedCode, setFixedCode] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  const analyzer = new ReactCodeAnalyzer();

  // Import the same auto-fix logic from useAnalyzer
  const applyAutoFix = (fileName: string, content: string, issue: CodeIssue): string => {
    let fixedContent = content;

    switch (issue.type) {
      case 'console-statements':
        // Remove console.log statements with better pattern matching
        const lines = fixedContent.split('\n');
        if (issue.line && issue.line <= lines.length) {
          const lineIndex = issue.line - 1;
          const line = lines[lineIndex];
          if (line.includes('console.')) {
            // Remove the entire line if it only contains console statement
            if (line.trim().match(/^\s*console\.\w+\([^)]*\);?\s*$/)) {
              lines.splice(lineIndex, 1);
            } else {
              // Replace just the console statement
              lines[lineIndex] = line.replace(/console\.\w+\([^)]*\);?\s*/g, '');
            }
            fixedContent = lines.join('\n');
          }
        }
        break;

      case 'var-usage':
        // Replace var with const/let intelligently
        fixedContent = fixedContent.replace(/\bvar\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([^;]+);/g, (match, varName, value) => {
          // Use const for primitive values, let for objects/arrays that might be reassigned
          if (value.trim().match(/^[\d"'`true|false|null|undefined]/)) {
            return `const ${varName} = ${value};`;
          }
          return `let ${varName} = ${value};`;
        });
        break;

      case 'missing-alt-text':
        // Add meaningful alt attributes to img tags
        fixedContent = fixedContent.replace(
          /<img([^>]*?)(?:\s*\/?>)/g, 
          (match, attrs) => {
            if (!attrs.includes('alt=')) {
              // Try to extract meaningful alt text from src or nearby context
              const srcMatch = attrs.match(/src=['"]([^'"]*)['"]/);
              let altText = "Image";
              if (srcMatch) {
                const filename = srcMatch[1].split('/').pop()?.split('.')[0];
                if (filename) {
                  altText = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                }
              }
              return `<img${attrs} alt="${altText}" />`;
            }
            return match;
          }
        );
        break;

      case 'missing-aria-label':
        // Add aria-label to interactive elements without accessible names
        fixedContent = fixedContent.replace(
          /<(button|div|span)([^>]*?)(onClick[^>]*?)>/g,
          (match, tag, beforeAttrs, onClickAndAfter) => {
            if (!beforeAttrs.includes('aria-label=') && !beforeAttrs.includes('aria-labelledby=')) {
              return `<${tag}${beforeAttrs} aria-label="Interactive element"${onClickAndAfter}>`;
            }
            return match;
          }
        );
        break;

      case 'missing-key-prop':
        // Add key props to list items in map functions
        fixedContent = fixedContent.replace(
          /\.map\(([^)]*?)\s*=>\s*<([^>]*?)>/g,
          (match, mapParam, jsxTag) => {
            if (!jsxTag.includes('key=')) {
              const paramName = mapParam.split(',')[0].trim().replace(/[()]/g, '');
              // Try common key patterns
              const keyValue = `${paramName}.id || ${paramName}.key || index`;
              return match.replace(`<${jsxTag}>`, `<${jsxTag} key={${keyValue}}>`);
            }
            return match;
          }
        );
        break;

      case 'missing-effect-dependencies':
        // Add empty dependency array to useEffect
        fixedContent = fixedContent.replace(
          /useEffect\(([^,]+)\)/g,
          'useEffect($1, [])'
        );
        break;

      case 'component-naming':
        // Fix component naming to start with capital letter
        fixedContent = fixedContent.replace(
          /const\s+([a-z][a-zA-Z0-9]*)\s*=\s*\(/g,
          (match, name) => {
            const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
            return match.replace(name, capitalizedName);
          }
        );
        break;

      case 'inline-style-object':
        // Extract inline styles to const
        fixedContent = fixedContent.replace(
          /style=\{\{([^}]+)\}\}/g,
          (match, styleContent) => {
            const styleName = 'elementStyles';
            const styleDeclaration = `const ${styleName} = {${styleContent}};`;
            // Add style declaration at the beginning of the component
            const componentMatch = fixedContent.match(/(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)/);
            if (componentMatch) {
              fixedContent = fixedContent.replace(componentMatch[1], `${componentMatch[1]}\n  ${styleDeclaration}`);
            }
            return `style={${styleName}}`;
          }
        );
        break;

      case 'typescript-any-type':
        // Replace 'any' with more specific types
        fixedContent = fixedContent.replace(
          /:\s*any\b/g,
          ': unknown' // Use unknown as safer alternative
        );
        break;

      // Add more fix patterns as needed
      default:
        console.debug(`Auto-fix not implemented for issue type: ${issue.type}`);
    }

    return fixedContent;
  };

  useEffect(() => {
    // Track demo usage
    const count = parseInt(localStorage.getItem('demoUsageCount') || '0');
    setDemoUsageCount(count);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCode(demoExamples[selectedExample].code);
    setAnalysis(null);
    setFixedCode('');
  }, [selectedExample]);

  const analyzeCode = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    try {
      const projectAnalysis = analyzer.analyzeProject([{
        name: 'demo.tsx',
        content: code
      }]);

      setAnalysis(projectAnalysis);

      // Apply all auto-fixable issues using the same logic as the main analyzer
      let fixedContent = code;
      const autoFixableIssues = projectAnalysis.files[0]?.issues.filter(issue => issue.autoFixable) || [];

      autoFixableIssues.forEach(issue => {
        fixedContent = applyAutoFix('demo.tsx', fixedContent, issue);
      });

      setFixedCode(fixedContent);

      // Track usage
      const newCount = demoUsageCount + 1;
      setDemoUsageCount(newCount);
      localStorage.setItem('demoUsageCount', newCount.toString());

      toast({
        title: "Analysis Complete",
        description: `Found ${projectAnalysis.summary.totalIssues} issues in your code`,
      });
    } catch (error) {
      console.error('Demo analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your code",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to download fixed files",
        variant: "destructive",
      });
      return;
    }

    const codeToDownload = fixedCode || code;
    const blob = new Blob([codeToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fixed_demo.tsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: "Your fixed code has been downloaded",
    });
  };

  const getSeverityIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Try NeuroLint Now
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Paste your React code below and see instant analysis results. 
            Experience the power of automated code review before signing up.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Code Editor Section */}
          <Card className="bg-card border-border shadow-2xl">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-3 text-card-foreground">
                <Code className="w-6 h-6 text-blue-400" />
                Code Editor
              </CardTitle>
              <div className="flex gap-2 flex-wrap mt-4">
                {Object.entries(demoExamples).map(([key, example]) => (
                  <Button
                    key={key}
                    variant={selectedExample === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedExample(key as keyof typeof demoExamples)}
                    className={selectedExample === key 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }
                  >
                    {example.title}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <DemoCodeEditor
                value={code}
                onChange={setCode}
                language="typescript"
              />
              <div className="mt-6 flex gap-3 flex-wrap">
                <Button variant="default" onClick={analyzeCode}
                  disabled={isAnalyzing || !code.trim()}
                  className="flex items-center gap-2 px-6 py-2.5"
                >
                  <Play className="w-4 h-4" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
                </Button>

                {analysis && (
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="flex items-center gap-1 bg-red-900/20 border-red-600 text-red-400">
                      {getSeverityIcon('error')}
                      {analysis.summary.errorCount} Errors
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 bg-yellow-900/20 border-yellow-600 text-yellow-400">
                      {getSeverityIcon('warning')}
                      {analysis.summary.warningCount} Warnings
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 bg-blue-900/20 border-blue-600 text-blue-400">
                      {getSeverityIcon('info')}
                      {analysis.summary.infoCount} Info
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results Section */}
          <Card className="bg-card border-border shadow-2xl">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-3 text-card-foreground">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!analysis ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Code className="w-20 h-20 mx-auto mb-6 opacity-50" />
                  <p className="text-lg">Click "Analyze Code" to see results</p>
                </div>
              ) : (
                <>
                  <DemoAnalysisResults analysis={analysis} />

                  {analysis.summary.totalIssues > 0 && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <Button variant="default" onClick={handleDownload}
                        disabled={!user}
                        className="w-full flex items-center gap-2 py-3"
                      >
                        <Download className="w-5 h-5" />
                        {user ? 'Download Fixed Files' : 'Sign in to Download'}
                      </Button>

                      {!user && (
                        <p className="text-sm text-muted-foreground text-center mt-3">
                          Sign in to download automatically fixed code
                        </p>
                      )}

                      {fixedCode && fixedCode !== code && (
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                          <p className="text-sm text-green-400 font-medium">
                            ✅ Code has been automatically fixed!
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            The downloaded file will contain the corrected code with {analysis.summary.autoFixableCount} issues resolved.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Prompt */}
        {demoUsageCount >= 3 && !user && (
          <Card className="mt-12 border-blue-600/30 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  Ready to unlock the full power?
                </h3>
                <p className="text-muted-foreground mb-6 text-lg max-w-2xl mx-auto">
                  You've tried the demo {demoUsageCount} times. Sign up now for unlimited analysis, 
                  automatic fixes, and advanced features.
                </p>
                <Button variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-primary-foreground px-8 py-3 text-lg">
                  Get Started Free
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};