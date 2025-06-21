
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Layers } from 'lucide-react';

interface LayerResultsProps {
  results: {
    layers?: Array<{
      id: number;
      name: string;
      applied: boolean;
      changes: number;
      duration: number;
      error?: string;
    }>;
    processingTime?: number;
    enabledLayers?: number[];
    error?: string;
  };
}

export function LayerResults({ results }: LayerResultsProps) {
  if (results.error) {
    return (
      <Card className="bg-red-900/20 border-red-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="w-5 h-5" />
            <span>Error: {results.error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results.layers || results.layers.length === 0) {
    return (
      <Card className="bg-black/30 border-gray-700">
        <CardContent className="p-4">
          <div className="text-center text-gray-400">
            No layer information available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-black/30 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Layers className="w-5 h-5" />
            Layer Processing Results
            {results.processingTime && (
              <Badge variant="outline" className="ml-auto">
                <Clock className="w-3 h-3 mr-1" />
                {results.processingTime}ms
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {results.layers.map((layer) => (
            <div
              key={layer.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-600"
            >
              <div className="flex items-center gap-3">
                {layer.applied ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <div className="text-white font-medium">
                    Layer {layer.id}: {layer.name}
                  </div>
                  {layer.error && (
                    <div className="text-red-400 text-sm">{layer.error}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={layer.applied ? "default" : "destructive"}>
                  {layer.changes} changes
                </Badge>
                <Badge variant="outline">
                  {layer.duration}ms
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
