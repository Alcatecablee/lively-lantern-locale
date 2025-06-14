
import React from "react";
import { NeuroLintLayerResult } from "@/lib/neurolint/orchestrator";
import { Badge } from "@/components/ui/badge";

interface TransformationInsightsProps {
  results: NeuroLintLayerResult[];
}

export function TransformationInsights({ results }: TransformationInsightsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="font-medium text-lg">Transformation Pipeline</div>
      <div className="grid md:grid-cols-2 gap-3">
        {results.map((result, idx) => (
          <div key={result.name} className="rounded bg-white/70 px-4 py-3 shadow flex flex-col gap-1 border">
            <div className="flex items-center gap-2">
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "Success" : "Error"}
              </Badge>
              <span className="font-semibold">{idx + 1}. {result.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">{result.description}</div>
            {result.message && <div className="mt-1 text-xs text-warning">{result.message}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
