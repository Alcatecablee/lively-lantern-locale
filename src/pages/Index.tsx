import { useState } from "react";
import { FileUploadZone } from "@/components/neurolint/FileUploadZone";
import { CodeDiffViewer } from "@/components/neurolint/CodeDiffViewer";
import { TransformationInsights } from "@/components/neurolint/TransformationInsights";
import { NeuroLintOrchestrator, NeuroLintLayerResult, LAYER_LIST } from "@/lib/neurolint/orchestrator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Clock, FileCode, TestTube, Users, ArrowRight, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LayerSelector } from "@/components/neurolint/LayerSelector"; // NEW: import the selector

const LAYERS = [
  {
    name: "Configuration Optimization",
    description: "Modernizes TypeScript, Next.js, and package.json configs for maximum compatibility and best practices.",
    status: "live",
  },
  {
    name: "Project Entities Refactor",
    description: "Cleans and restructures code entities for maintainability and clarity.",
    status: "soon",
  },
  {
    name: "Component Enhancement",
    description: "Improves React components with smart rewrites, import fixing, and missing key detection.",
    status: "soon",
  },
  {
    name: "Hydration & Runtime Fixes",
    description: "Detects and fixes hydration and SSR bugs for flawless React/Next.js deployments.",
    status: "soon",
  },
  {
    name: "Next.js Optimization",
    description: "Enforces Next.js conventions and integrates optimization strategies automatically.",
    status: "soon",
  },
  {
    name: "Testing Validation",
    description: "Ensures components and configs are test-ready with basic static analysis.",
    status: "soon",
  },
];

const EXPERIMENTAL_LAYERS = LAYERS.filter(l => l.status === "soon");

const Index = () => {
  const navigate = useNavigate();
  const [originalCode, setOriginalCode] = useState<string>("");
  const [transformedCode, setTransformedCode] = useState<string>("");
  const [insights, setInsights] = useState<NeuroLintLayerResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  // NEW: Add layer selection state -- default on only for LIVE layers, map to orchestrator layer IDs (1-4)
  const liveLayerIds = LAYER_LIST.map(layer => layer.id); // All supported, not just "live"
  const [enabledLayers, setEnabledLayers] = useState<number[]>([1]); // Show 1 as default ON (just Layer 1 live by default)

  // Handler for resetting transformedCode on file re-upload
  const handleFileUpload = async (code: string, uploadedFileName?: string) => {
    setOriginalCode(code);
    setFileName(uploadedFileName || "uploaded-file");
    setProcessing(true);

    try {
      const startTime = Date.now();
      // NEW: Pass enabledLayers to orchestrator!
      const { transformed, layers } = await NeuroLintOrchestrator(code, undefined, true, enabledLayers);
      const totalTime = Date.now() - startTime;

      setTransformedCode(transformed);
      setInsights(layers);

      // Log processing stats
      console.log(`🧠 NeuroLint completed in ${totalTime}ms`);
      console.log(
        `📊 Processed ${layers.length} layers with ${layers.filter((l) => l.success).length} successful`
      );
    } catch (error) {
      console.error("NeuroLint processing failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  const stats =
    insights.length > 0
      ? {
          totalChanges: insights.reduce((sum, r) => sum + (r.changeCount || 0), 0),
          totalTime: insights.reduce((sum, r) => sum + (r.executionTime || 0), 0),
          successfulLayers: insights.filter((r) => r.success).length,
          improvements: insights.flatMap((r) => r.improvements || []).length,
        }
      : null;

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
              AI Config Optimizer <span className="text-purple-400">(Layer 1/6 live)</span>
            </span>
            <div className="ml-auto flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/landing")}
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Learn More
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/test")}
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                Test Suite
              </Button>
            </div>
          </CardTitle>
          {/* CALL TO ACTION for collaborator/testers */}
          <div className="flex flex-col sm:flex-row gap-2 mt-5">
            <span className="flex items-center text-blue-400 font-semibold text-base">
              <Users className="mr-2" />
              <span>
                Engineers/Ai experts: Help us unlock safe, automated multi-layer code repair!
              </span>
            </span>
            <Button
              className="bg-gradient-to-r from-blue-700 to-purple-500 text-white font-semibold text-base"
              onClick={() =>
                window.open(
                  "mailto:founder@neurolint.com?subject=I want to collaborate!",
                  "_blank"
                )
              }
            >
              Get Involved
            </Button>
          </div>
          {/* DEMO: Experimental layer toggle zone */}
          <div className="mt-6 flex flex-wrap items-center gap-3 bg-yellow-950/80 border border-yellow-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Experimental Layers (Demo Only):</span>
            </div>
            {EXPERIMENTAL_LAYERS.map((layer, idx) => (
              <label key={layer.name} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  disabled
                  checked={false}
                  className="form-checkbox rounded border-blue-400 accent-purple-400 w-5 h-5"
                  tabIndex={-1}
                />
                <span className="text-xs text-yellow-200 mr-1">{layer.name}</span>
              </label>
            ))}
            <span className="text-xs text-yellow-400">(Not yet live. Want to help? <a href="mailto:founder@neurolint.com" className="underline text-blue-200">Contact me!</a>)</span>
          </div>
          {/* NEW: Selector for which layers to run */}
          <div className="my-4">
            <LayerSelector
              enabledLayers={enabledLayers}
              setEnabledLayers={setEnabledLayers}
            />
            <div className="text-xs text-blue-200 font-medium mt-1 ml-1">
              Select which layers to run in this session. <span className="text-purple-300">Layer 1 (Config Optimization) is live and recommended for production use. Other layers are experimental.</span>
            </div>
          </div>
          {/* ... keep existing code (stats Badges and rest of CardHeader) */}
          <div className="flex flex-col lg:flex-row gap-4 mt-5">
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <FileCode className="w-3 h-3" />
                {stats ? stats.totalChanges : 0} Changes Applied
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {stats ? stats.totalTime : 0}ms Processing Time
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {stats ? stats.improvements : 0} Improvements
              </Badge>
              <Badge
                variant={
                  stats && stats.successfulLayers === 1 ? "default" : "destructive"
                }
                className="flex items-center gap-1"
              >
                {stats ? stats.successfulLayers : 0}/{enabledLayers.length} Layers Successful
              </Badge>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Users className="w-4 h-4 text-blue-300" />
              <span className="text-xs text-blue-200 font-bold">
                Looking for Technical Co-Founder!
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex flex-col gap-6 flex-1">
              <FileUploadZone onFile={handleFileUpload} processing={processing} />
              {insights.length > 0 && <TransformationInsights results={insights} />}
              <div className="mt-8 flex flex-col gap-2">
                <div className="text-base font-semibold text-white mb-2">Our 6-Layer AI Pipeline</div>
                <div className="flex flex-col gap-1">
                  {LAYERS.map((layer, idx) => (
                    <div key={layer.name} className="flex items-center gap-2 text-xs">
                      <Badge
                        variant={layer.status === "live" ? "default" : "secondary"}
                        className={layer.status === "live" ? "bg-green-600" : "bg-gray-700"}
                      >
                        {layer.status === "live" ? "LIVE" : "SOON"}
                      </Badge>
                      <span className={layer.status === "live" ? "text-white font-medium" : "text-gray-400"}>
                        {idx + 1}. {layer.name}
                      </span>
                      <span className="ml-2 text-gray-300">{layer.description}</span>
                    </div>
                  ))}
                </div>
              </div>
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
          <span className="font-semibold">Revolutionary AI-Powered Config Optimization (Layer 1/6)</span>
        </div>
        <p>
          Drop a <strong>.js, .jsx, .ts, .tsx</strong> code or config file to experience our <b>configuration optimization layer</b>. <br />
          Only Layer 1 of our planned 6-layer AI pipeline is currently live—see all planned layers above!
        </p>
      </div>
      <div className="mt-6 flex flex-col items-center font-sans">
        <Card className="bg-black/70 border-blue-400/25 shadow-inner max-w-md w-full px-6 py-4">
          <div className="flex items-center gap-2 text-blue-300 font-semibold text-lg mb-2">
            <Users className="w-5 h-5" />
            Looking for Technical Co-Founder
          </div>
          <div className="text-sm text-blue-100">
            Join me to help build the world’s first fully-automated, multi-layer code refactoring platform! <br />
            <b>Email:</b> 
            <a
              href="mailto:founder@neurolint.com"
              className="ml-1 underline hover:text-blue-400"
            >
              founder@neurolint.com
            </a>
            <br />
            Or DM on Product Hunt!
          </div>
          <Button
            className="mt-4 w-full bg-gradient-to-r from-blue-700 to-purple-500 text-white"
            onClick={() =>
              window.open("mailto:founder@neurolint.com?subject=Interested in NeuroLint as Co-Founder!", "_blank")
            }
          >
            Contact to Collaborate
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Index;
