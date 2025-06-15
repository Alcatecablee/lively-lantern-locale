
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Code, Play } from 'lucide-react';
import { NeuroLintOrchestrator } from '@/lib/neurolint/orchestrator';
import { validateJSXIntegrity } from '@/lib/neurolint/validation/jsx-validator';

const SAMPLE_CODE = `import React from 'react';
import { useState } from 'react';
import React from 'react';

// Sample component with HTML entities and other issues
function MyComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Hello &amp; Welcome!</h1>
      <p>This is a &quot;test&quot; component with &lt;HTML&gt; entities.</p>
      <p>Price: &#36;99.99 &euro;85.50</p>
      <p>Copyright &copy; 2024 &ndash; All rights reserved.</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count} &nbsp; Click me!
      </button>
      <div>
        Special chars: &sect; &para; &bull; &deg; &trade;
      </div>
    </div>
  );
}

export default MyComponent;`;

export function ValidationTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    transformed: string;
    layers: any[];
    jsxIntegrity: boolean;
    issues: string[];
  } | null>(null);

  const runTransformation = async () => {
    setIsRunning(true);
    try {
      const { transformed, layers } = await NeuroLintOrchestrator(SAMPLE_CODE, undefined, true);
      const jsxValidation = validateJSXIntegrity(SAMPLE_CODE, transformed);
      
      const issues = [];
      if (transformed.includes('&quot;')) issues.push('HTML entities not decoded');
      if (!transformed.includes("'use client'")) issues.push('Missing use client directive');
      if (transformed.includes('import React from \'react\';\nimport { useState } from \'react\';\nimport React from \'react\';')) {
        issues.push('Duplicate imports not cleaned');
      }
      if (!transformed.includes('aria-label')) issues.push('Missing accessibility attributes');
      
      setResult({
        transformed,
        layers,
        jsxIntegrity: jsxValidation.isValid,
        issues
      });
    } catch (error) {
      console.error('Transformation failed:', error);
    }
    setIsRunning(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          HTML Entity & JSX Validation Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTransformation} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Test Transformation'}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={result.jsxIntegrity ? "default" : "destructive"} className="flex items-center gap-1">
                {result.jsxIntegrity ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                JSX Integrity: {result.jsxIntegrity ? 'Valid' : 'Corrupted'}
              </Badge>
              <Badge variant={result.issues.length === 0 ? "default" : "secondary"}>
                Issues: {result.issues.length}
              </Badge>
            </div>

            {result.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-700">Remaining Issues:</h4>
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="w-3 h-3" />
                    {issue}
                  </div>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Original Code</h4>
                <ScrollArea className="h-64 rounded border bg-muted p-3">
                  <pre className="text-xs">
                    <code>{SAMPLE_CODE}</code>
                  </pre>
                </ScrollArea>
              </div>
              <div>
                <h4 className="font-medium mb-2">Transformed Code</h4>
                <ScrollArea className="h-64 rounded border bg-muted p-3">
                  <pre className="text-xs">
                    <code>{result.transformed}</code>
                  </pre>
                </ScrollArea>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Layer Results:</h4>
              {result.layers.map((layer, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {layer.success ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                  {layer.name} ({layer.executionTime}ms)
                  {layer.improvements && layer.improvements.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {layer.improvements.length} fixes
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
