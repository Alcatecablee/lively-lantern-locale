import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeExample as CodeExampleType } from "@/types/education";
import { 
  Code, 
  CheckCircle, 
  ArrowRight, 
  Lightbulb, 
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';

interface CodeExampleProps extends React.HTMLAttributes<HTMLDivElement> {
  example: CodeExampleType;
  onUnderstand?: () => void;
}

export const CodeExample: React.FC<CodeExampleProps> = ({ 
  example,
  onUnderstand
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'before' | 'after'>('before');

  const copyToClipboard = async (code: string, type: 'before' | 'after') => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const formatCode = (code: string) => {
    // Simple code formatting - in a real app, you'd use a proper syntax highlighter
    return code
      .split('\n')
      .map((line, index) => (
        <div key={index} className="flex">
          <span className="text-gray-400 text-sm mr-4 select-none w-8 text-right">
            {index + 1}
          </span>
          <span className="flex-1">{line}</span>
        </div>
      ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="h-5 w-5 mr-2" />
            Code Example
          </CardTitle>
          <CardDescription>
            Compare the problematic code with the improved version
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'before' | 'after')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="before" className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Before (Problematic)
              </TabsTrigger>
              <TabsTrigger value="after" className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                After (Improved)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="before" className="space-y-4">
              <div className="relative">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Badge variant="destructive" className="mr-2">
                        {example.before.language}
                      </Badge>
                      <span className="text-sm text-red-700 font-medium">
                        Problematic Code
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(example.before.code, 'before')}
                      className="h-8 w-8 p-0"
                    >
                      {copiedCode === 'before' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-white border rounded p-3 text-sm font-mono overflow-x-auto">
                    <code>{formatCode(example.before.code)}</code>
                  </pre>
                </div>
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{example.before.explanation}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="after" className="space-y-4">
              <div className="relative">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-2 bg-green-100 text-green-800">
                        {example.after.language}
                      </Badge>
                      <span className="text-sm text-green-700 font-medium">
                        Improved Code
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(example.after.code, 'after')}
                      className="h-8 w-8 p-0"
                    >
                      {copiedCode === 'after' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-white border rounded p-3 text-sm font-mono overflow-x-auto">
                    <code>{formatCode(example.after.code)}</code>
                  </pre>
                </div>
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700">{example.after.explanation}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {example.keyChanges && example.keyChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Key Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {example.keyChanges.map((change, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{change}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <div className="flex justify-center">
        <Button variant="default" onClick={onUnderstand} className="flex items-center">
          I understand the concept
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}; 