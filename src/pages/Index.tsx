
import { useState } from "react";
import { FileUploadZone } from "@/components/neurolint/FileUploadZone";
import { CodeDiffViewer } from "@/components/neurolint/CodeDiffViewer";
import { TransformationInsights } from "@/components/neurolint/TransformationInsights";
import { NeuroLintOrchestrator, NeuroLintLayerResult } from "@/lib/neurolint/orchestrator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Clock, FileCode } from "lucide-react";

const Index = () => {
  const [originalCode, setOriginalCode] = useState<string>("");
  const [transformedCode, setTransformedCode] = useState<string>("");
  const [insights, setInsights] = useState<NeuroLintLayerResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = async (code: string, uploadedFileName?: string) => {
    setOriginalCode(code);
    setFileName(uploadedFileName || "uploaded-file");
    setProcessing(true);
    
    try {
      const startTime = Date.now();
      const { transformed, layers } = await NeuroLintOrchestrator(code);
      const totalTime = Date.now() - startTime;
      
      setTransformedCode(transformed);
      setInsights(layers);
      
      // Log processing stats
      console.log(`🧠 NeuroLint completed in ${totalTime}ms`);
      console.log(`📊 Processed ${layers.length} layers with ${layers.filter(l => l.success).length} successful`);
      
    } catch (error) {
      console.error("NeuroLint processing failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  const stats = insights.length > 0 ? {
    totalChanges: insights.reduce((sum, r) => sum + (r.changeCount || 0), 0),
    totalTime: insights.reduce((sum, r) => sum + (r.executionTime || 0), 0),
    successfulLayers: insights.filter(r => r.success).length,
    improvements: insights.flatMap(r => r.improvements || []).length,
  } : null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-2 py-12 bg-gradient-to-br from-[#22242B] via-[#181921] to-[#16151a] dark">
      <Card className="w-full max-w-6xl bg-black/80 border border-[#292939] rounded-xl shadow-cursor-glass transition-all backdrop-blur-lg font-sans">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="tracking-tighter font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NeuroLint
            </span>
            <span className="font-normal text-xl text-muted-foreground pl-2">
              Intelligent Code Transformation Engine
            </span>
          </CardTitle>
          
          {stats && (
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <FileCode className="w-3 h-3" />
                {stats.totalChanges} Changes Applied
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {stats.totalTime}ms Processing Time
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {stats.improvements} Improvements
              </Badge>
              <Badge variant={stats.successfulLayers === 6 ? "default" : "destructive"} className="flex items-center gap-1">
                {stats.successfulLayers}/6 Layers Successful
              </Badge>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex flex-col gap-6 flex-1">
              <FileUploadZone onFile={handleFileUpload} processing={processing} />
              {insights.length > 0 && <TransformationInsights results={insights} />}
            </div>
            
            <div className="flex-1 rounded-lg border border-[#292939] bg-gradient-to-br from-[#232336] to-[#191B22] shadow-cursor-glass overflow-hidden">
              <CodeDiffViewer
                original={originalCode}
                transformed={transformedCode}
                loading={processing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center text-muted-foreground text-sm font-sans max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="font-semibold">Revolutionary AI-Powered Code Intelligence</span>
        </div>
        <p>
          Drop a <strong>.js, .jsx, .ts, .tsx</strong> file to experience our 6-layer transformation pipeline: 
          Config optimization, pattern cleanup, component enhancement, hydration fixes, Next.js optimization, and testing validation.
        </p>
      </div>
    </div>
  );
};

export default Index;
