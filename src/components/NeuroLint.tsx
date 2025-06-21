
import React, { useState } from 'react';
import { LayerSelector } from '@/components/neurolint/LayerSelector';
import { CodeInput } from '@/components/neurolint/CodeInput';
import { TestRunner } from '@/components/neurolint/TestRunner';
import { GitHubUpload } from '@/components/neurolint/GitHubUpload';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function NeuroLint() {
  // Initialize with all layers enabled by default
  const [enabledLayers, setEnabledLayers] = useState<number[]>([1, 2, 3, 4]);

  console.log('NeuroLint component rendered with enabled layers:', enabledLayers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            NeuroLint
          </h1>
          <p className="text-gray-300 text-lg">
            AI-Powered Code Analysis & Transformation
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="bg-black/30 border-gray-700 p-6 mb-6">
            <LayerSelector 
              enabledLayers={enabledLayers}
              setEnabledLayers={setEnabledLayers}
            />
          </Card>

          <Tabs defaultValue="transform" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/30">
              <TabsTrigger value="transform">Transform Code</TabsTrigger>
              <TabsTrigger value="test">Test Runner</TabsTrigger>
              <TabsTrigger value="github">GitHub Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transform">
              <CodeInput enabledLayers={enabledLayers} />
            </TabsContent>
            
            <TabsContent value="test">
              <TestRunner enabledLayers={enabledLayers} />
            </TabsContent>
            
            <TabsContent value="github">
              <GitHubUpload enabledLayers={enabledLayers} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
