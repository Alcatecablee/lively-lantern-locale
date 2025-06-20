
import { useState } from "react";
import { FileUploadZone } from "@/components/neurolint/FileUploadZone";
import { GitHubUpload } from "@/components/neurolint/GitHubUpload";
import { RepoProcessor } from "@/components/neurolint/RepoProcessor";
import { CodeDiffViewer } from "@/components/neurolint/CodeDiffViewer";
import { TransformationInsights } from "@/components/neurolint/TransformationInsights";
import { NeuroLintOrchestrator, NeuroLintLayerResult, LAYER_LIST } from "@/lib/neurolint/orchestrator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileCode, Github } from "lucide-react";
import { LayerSelector } from "@/components/neurolint/LayerSelector";
import { HowToDropDown } from "@/components/neurolint/HowToDropDown";
import { BetaBanner } from "@/components/BetaBanner";

interface RepoFile {
  path: string;
  content: string;
  transformed?: string;
  insights?: NeuroLintLayerResult[];
}

const AppPage = () => {
  const [originalCode, setOriginalCode] = useState<string>("");
  const [transformedCode, setTransformedCode] = useState<string>("");
  const [insights, setInsights] = useState<NeuroLintLayerResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [enabledLayers, setEnabledLayers] = useState<number[]>([1]);
  
  // Repository processing state
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);
  const [mode, setMode] = useState<'single' | 'repo'>('single');

  const handleFileUpload = async (code: string) => {
    setOriginalCode(code);
    setProcessing(true);
    try {
      const startTime = Date.now();
      const {
        transformed,
        layers
      } = await NeuroLintOrchestrator(code, undefined, true, enabledLayers);
      setTransformedCode(transformed);
      setInsights(layers);
      console.log(`NeuroLint ran in ${Date.now() - startTime}ms for layers`, enabledLayers);
    } catch (error) {
      console.error("NeuroLint processing failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRepoUpload = (files: { path: string; content: string }[]) => {
    setRepoFiles(files.map(f => ({ ...f })));
    setMode('repo');
  };

  const handleRepoProcessingComplete = (processedFiles: RepoFile[]) => {
    setRepoFiles(processedFiles);
  };

  const stats = insights.length > 0 ? {
    totalChanges: insights.reduce((sum, r) => sum + (r.changeCount || 0), 0),
    totalTime: insights.reduce((sum, r) => sum + (r.executionTime || 0), 0),
    successfulLayers: insights.filter(r => r.success).length
  } : null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-2 py-8 bg-[#181921] dark">
      <BetaBanner />
      <Card className="w-full max-w-4xl bg-[#181B26] border border-[#292939] rounded-xl shadow-cursor-glass transition-all backdrop-blur-lg font-sans">
        <CardHeader>
          <HowToDropDown />
          <div className="mt-3">
            <LayerSelector enabledLayers={enabledLayers} setEnabledLayers={setEnabledLayers} />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'single' | 'repo')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Single File
              </TabsTrigger>
              <TabsTrigger value="repo" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Repository
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-6">
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
                  <CodeDiffViewer original={originalCode} transformed={transformedCode} loading={false} />
                </div>
              )}
              
              {!processing && insights.length === 0 && originalCode && (
                <div className="mt-8">
                  <CodeDiffViewer original={originalCode} transformed={transformedCode} loading={false} />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="repo" className="space-y-6">
              {repoFiles.length === 0 ? (
                <GitHubUpload onRepoUpload={handleRepoUpload} processing={processing} />
              ) : (
                <RepoProcessor 
                  files={repoFiles} 
                  enabledLayers={enabledLayers}
                  onComplete={handleRepoProcessingComplete}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppPage;
