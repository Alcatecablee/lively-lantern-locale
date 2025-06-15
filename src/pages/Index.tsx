
import { useState } from "react";
import { FileUploadZone } from "@/components/neurolint/FileUploadZone";
import { CodeDiffViewer } from "@/components/neurolint/CodeDiffViewer";
import { TransformationInsights } from "@/components/neurolint/TransformationInsights";
import { NeuroLintOrchestrator, NeuroLintLayerResult, LAYER_LIST } from "@/lib/neurolint/orchestrator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { LayerSelector } from "@/components/neurolint/LayerSelector";

const Index = () => {
  const [originalCode, setOriginalCode] = useState<string>("");
  const [transformedCode, setTransformedCode] = useState<string>("");
  const [insights, setInsights] = useState<NeuroLintLayerResult[]>([]);
  const [processing, setProcessing] = useState(false);

  // Show only Layer 1 by default (core stable), but selector allows more
  const [enabledLayers, setEnabledLayers] = useState<number[]>([1]);

  // Handle file upload (or paste), run selected layers
  const handleFileUpload = async (code: string) => {
    setOriginalCode(code);
    setProcessing(true);

    try {
      const startTime = Date.now();
      const { transformed, layers } = await NeuroLintOrchestrator(code, undefined, true, enabledLayers);
      setTransformedCode(transformed);
      setInsights(layers);
      console.log(`NeuroLint ran in ${Date.now() - startTime}ms for layers`, enabledLayers);
    } catch (error) {
      console.error("NeuroLint processing failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Basic stats for modal summary on result (mobile-friendly)
  const stats =
    insights.length > 0
      ? {
          totalChanges: insights.reduce((sum, r) => sum + (r.changeCount || 0), 0),
          totalTime: insights.reduce((sum, r) => sum + (r.executionTime || 0), 0),
          successfulLayers: insights.filter((r) => r.success).length,
        }
      : null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-2 py-8 bg-[#181921] dark">
      <Card className="w-full max-w-xl bg-[#181B26] border border-[#292939] rounded-xl shadow-cursor-glass transition-all backdrop-blur-lg font-sans">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="tracking-tighter font-bold text-white">
              NeuroLint
            </span>
          </CardTitle>
          <div className="mt-3">
            <LayerSelector
              enabledLayers={enabledLayers}
              setEnabledLayers={setEnabledLayers}
            />
          </div>
        </CardHeader>
        <CardContent>
          <FileUploadZone onFile={handleFileUpload} processing={processing} />
          {processing && (
            <div className="flex justify-center items-center mt-5 text-purple-200 animate-pulse">
              Running selected NeuroLint layers...
            </div>
          )}
          {!processing && insights.length > 0 && (
            <div className="mt-6 flex flex-col gap-6">
              <TransformationInsights results={insights} />
              <div className="flex flex-col gap-2 mt-2 text-xs text-muted-foreground">
                <span>
                  <b>{stats?.totalChanges ?? 0}</b> changes &nbsp;&middot;&nbsp;
                  <b>{stats?.totalTime ?? 0}ms</b> &nbsp;&middot;&nbsp;
                  <b>{stats?.successfulLayers ?? 0}</b>/{enabledLayers.length} layers successful
                </span>
              </div>
              <CodeDiffViewer
                original={originalCode}
                transformed={transformedCode}
                loading={false}
              />
            </div>
          )}
          {/* If nothing uploaded yet, just show the diff empty state */}
          {!processing && insights.length === 0 && (
            <div className="mt-8">
              <CodeDiffViewer
                original={originalCode}
                transformed={transformedCode}
                loading={false}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
