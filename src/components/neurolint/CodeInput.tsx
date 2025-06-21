
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Sparkles, Code2, Zap } from 'lucide-react';
import { NeuroLintOrchestrator } from '@/lib/neurolint/orchestrator';
import { LayerResults } from './LayerResults';
import { CodeComparison } from './CodeComparison';

interface CodeInputProps {
  enabledLayers: number[];
}

export function CodeInput({ enabledLayers }: CodeInputProps) {
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleTransform = async () => {
    if (!code.trim()) return;

    console.log('Starting transformation with enabled layers:', enabledLayers);
    setIsProcessing(true);
    setResults(null);

    try {
      const startTime = Date.now();
      const result = await NeuroLintOrchestrator(
        code,
        'input.tsx',
        true, // useAST
        enabledLayers // Pass the enabled layers
      );
      const processingTime = Date.now() - startTime;

      console.log('Transformation complete:', {
        enabledLayers,
        processingTime,
        layerCount: result.layers.length,
        hasChanges: result.transformed !== code
      });

      setResults({
        ...result,
        processingTime,
        originalCode: code,
        enabledLayers
      });
    } catch (error) {
      console.error('Transformation failed:', error);
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        originalCode: code,
        enabledLayers
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Code2 className="w-5 h-5" />
            Code Input
            <span className="text-sm font-normal text-gray-400">
              (Layers: {enabledLayers.length > 0 ? enabledLayers.join(', ') : 'None'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your React/TypeScript code here..."
            className="min-h-[200px] bg-gray-900/50 border-gray-600 text-white font-mono text-sm"
          />
          <Button 
            onClick={handleTransform}
            disabled={!code.trim() || isProcessing || enabledLayers.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Transform Code
                <Sparkles className="w-4 h-4" />
              </div>
            )}
          </Button>
          {enabledLayers.length === 0 && (
            <p className="text-amber-400 text-sm text-center">
              Please enable at least one layer above to transform code.
            </p>
          )}
        </CardContent>
      </Card>

      {results && (
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/30">
            <TabsTrigger value="comparison">Before/After</TabsTrigger>
            <TabsTrigger value="layers">Layer Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison">
            <CodeComparison results={results} />
          </TabsContent>
          
          <TabsContent value="layers">
            <LayerResults results={results} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
