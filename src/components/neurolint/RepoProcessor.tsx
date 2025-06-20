
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, Zap, Download, AlertTriangle } from "lucide-react";
import { NeuroLintOrchestrator, NeuroLintLayerResult } from "@/lib/neurolint/orchestrator";

interface RepoFile {
  path: string;
  content: string;
  transformed?: string;
  insights?: NeuroLintLayerResult[];
}

interface RepoProcessorProps {
  files: RepoFile[];
  enabledLayers: number[];
  onComplete: (processedFiles: RepoFile[]) => void;
}

export function RepoProcessor({ files, enabledLayers, onComplete }: RepoProcessorProps) {
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<RepoFile[]>([]);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [progress, setProgress] = useState({ current: 0, total: files.length });

  const processRepository = async () => {
    setProcessing(true);
    setProcessedFiles([]);
    
    const results: RepoFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFile(file.path);
      setProgress({ current: i + 1, total: files.length });
      
      try {
        const { transformed, layers } = await NeuroLintOrchestrator(
          file.content,
          file.path,
          true,
          enabledLayers
        );
        
        results.push({
          ...file,
          transformed,
          insights: layers
        });
      } catch (error) {
        console.error(`Error processing ${file.path}:`, error);
        results.push({
          ...file,
          transformed: file.content, // Keep original if processing fails
          insights: []
        });
      }
      
      setProcessedFiles([...results]);
    }
    
    setProcessing(false);
    setCurrentFile("");
    onComplete(results);
  };

  const downloadResults = () => {
    // Create a summary report
    const summary = {
      repository: "GitHub Repository",
      processedAt: new Date().toISOString(),
      totalFiles: processedFiles.length,
      layersUsed: enabledLayers,
      files: processedFiles.map(file => ({
        path: file.path,
        hasChanges: file.transformed !== file.content,
        changeCount: file.insights?.reduce((sum, insight) => sum + (insight.changeCount || 0), 0) || 0,
        layers: file.insights?.map(insight => ({
          name: insight.name,
          success: insight.success,
          changeCount: insight.changeCount,
          improvements: insight.improvements
        })) || []
      }))
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neurolint-repo-results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalChanges = processedFiles.reduce((sum, file) => 
    sum + (file.insights?.reduce((s, insight) => s + (insight.changeCount || 0), 0) || 0), 0
  );

  const filesWithChanges = processedFiles.filter(file => file.transformed !== file.content).length;

  return (
    <div className="space-y-6">
      <Card className="bg-[#16171c]/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileCode className="w-5 h-5 text-purple-400" />
            Repository Processor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-400">{files.length}</div>
              <div className="text-sm text-muted-foreground">Total Files</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{filesWithChanges}</div>
              <div className="text-sm text-muted-foreground">Files Modified</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{totalChanges}</div>
              <div className="text-sm text-muted-foreground">Total Changes</div>
            </div>
          </div>

          {!processing && processedFiles.length === 0 && (
            <Button
              onClick={processRepository}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Process Repository ({files.length} files)
            </Button>
          )}

          {processing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-300">
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Processing repository...</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {progress.current}/{progress.total} files processed
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Current: {currentFile}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {processedFiles.length > 0 && !processing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-300">
                <FileCode className="w-4 h-4" />
                <span>Processing complete!</span>
              </div>
              <Button
                onClick={downloadResults}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Results Summary
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {processedFiles.length > 0 && (
        <Card className="bg-[#16171c]/90 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">File Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="files">File Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid gap-3">
                  {processedFiles.slice(0, 10).map((file, index) => {
                    const hasChanges = file.transformed !== file.content;
                    const changeCount = file.insights?.reduce((sum, insight) => sum + (insight.changeCount || 0), 0) || 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#22242B] rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-white truncate">{file.path}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasChanges ? (
                            <Badge className="bg-green-600 text-white">
                              {changeCount} changes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              No changes
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {processedFiles.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground">
                      ... and {processedFiles.length - 10} more files
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="files" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Detailed view of all processed files (showing first 5 with changes)
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {processedFiles
                    .filter(file => file.transformed !== file.content)
                    .slice(0, 5)
                    .map((file, index) => (
                      <div key={index} className="p-4 bg-[#22242B] rounded-lg">
                        <div className="font-medium text-white mb-2">{file.path}</div>
                        <div className="space-y-2">
                          {file.insights?.map((insight, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              {insight.success ? (
                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                              )}
                              <span className="text-muted-foreground">
                                {insight.name}: {insight.changeCount || 0} changes
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
