
import { useState } from "react";
import { FileUploadZone } from "@/components/neurolint/FileUploadZone";
import { CodeDiffViewer } from "@/components/neurolint/CodeDiffViewer";
import { TransformationInsights } from "@/components/neurolint/TransformationInsights";
import { NeuroLintOrchestrator, NeuroLintLayerResult } from "@/lib/neurolint/orchestrator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Index = () => {
  const [originalCode, setOriginalCode] = useState<string>("");
  const [transformedCode, setTransformedCode] = useState<string>("");
  const [insights, setInsights] = useState<NeuroLintLayerResult[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = async (code: string) => {
    setOriginalCode(code);
    setProcessing(true);
    const { transformed, layers } = await NeuroLintOrchestrator(code);
    setTransformedCode(transformed);
    setInsights(layers);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-2 py-12">
      <Card className="w-full max-w-5xl bg-white/60 backdrop-blur shadow-xl">
        <CardHeader>
          <CardTitle>
            🧠 NeuroLint <span className="font-normal text-xl text-muted-foreground">AST Transformation Playground</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col gap-6 flex-1">
              <FileUploadZone onFile={handleFileUpload} processing={processing} />
              {insights.length > 0 && <TransformationInsights results={insights} />}
            </div>
            <div className="flex-1">
              <CodeDiffViewer
                original={originalCode}
                transformed={transformedCode}
                loading={processing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 text-center text-muted-foreground text-sm">
        Drag & drop a <b>.js, .jsx, .ts, .tsx</b> file to see NeuroLint in action!
      </div>
    </div>
  );
};

export default Index;
