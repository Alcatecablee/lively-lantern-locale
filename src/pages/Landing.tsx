import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Clock, FileCode, TestTube, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LAYERS = [
  {
    name: "Configuration Optimization (LIVE)",
    description: "Modernizes TypeScript, Next.js, and package.json configs for maximum compatibility and best practices.",
    status: "live"
  },
  {
    name: "Project Entities Refactor",
    description: "Cleans and restructures code entities for maintainability and clarity.",
    status: "soon"
  },
  {
    name: "Component Enhancement",
    description: "Improves React components with smart rewrites, import fixing, and missing key detection.",
    status: "soon"
  },
  {
    name: "Hydration & Runtime Fixes",
    description: "Detects and fixes hydration and SSR bugs for flawless React/Next.js deployments.",
    status: "soon"
  },
  {
    name: "Next.js Optimization",
    description: "Enforces Next.js conventions and integrates optimization strategies automatically.",
    status: "soon"
  },
  {
    name: "Testing Validation",
    description: "Ensures components and configs are test-ready with basic static analysis.",
    status: "soon"
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-2 py-8 bg-gradient-to-br from-[#22242B] via-[#181921] to-[#16151a]">
      <Card className="w-full max-w-2xl bg-black/85 border border-[#292939] rounded-xl shadow-cursor-glass backdrop-blur-lg font-sans">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-white flex items-center gap-2 tracking-tighter">
            <Brain className="w-9 h-9 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NeuroLint
            </span>
            <div className="ml-auto">
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => navigate("/")}
              >
                <ArrowRight className="w-4 h-4" />
                Open App
              </Button>
            </div>
          </CardTitle>
          <div className="mt-2 text-lg text-muted-foreground font-medium">
            Future-proof your config files and codebase with a single drop.<br />
            <span className="font-semibold text-purple-300">
              <span className="text-white">All 6 expert AI layers are built and tested.</span> <br className="hidden sm:block" />
              <span>
                <span className="text-green-400">Layer 1 ("Configuration Optimization") is publicly available for instant results.</span> The rest can be run individually, but...
              </span>
              <br />
              <span className="text-blue-300">
                <b>Our challenge?</b> We need an orchestrator so all 6 layers can work together seamlessly, with no conflicts—everything works when run one-by-one, but combining them is the last boss battle.
              </span>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="my-6 flex flex-col gap-6">
            <div className="text-purple-100 text-sm mb-2 font-semibold">
              <span className="block mb-2">
                <Zap className="inline-block mr-2" />
                <b>What makes NeuroLint different?</b>
              </span>
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  <b>All code-fixing layers are production-ready and powerful individually:</b> config, patterns, component smarts, hydration/SSR, and more.
                </li>
                <li>
                  Robust dry run, backup, safety, transparency, and per-layer commands.
                </li>
                <li>
                  <span className="font-bold text-green-400">Seeking co-founder to master the orchestration—layers exist and are solid, we need help integrating them for truly seamless, automated multi-layer repair in a single run!</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-gray-200 text-base mb-1">
                6-Layer AI Roadmap (All Layers Built—Need Orchestration)
              </div>
              {LAYERS.map((layer, idx) => (
                <div key={layer.name} className="flex items-center gap-3 p-2 rounded bg-black/40 border border-[#292939]">
                  <Badge
                    variant={layer.status === "live" ? "default" : "secondary"}
                    className={layer.status === "live" ? "bg-green-600" : "bg-gray-700"}
                  >
                    {layer.status === "live" ? "LIVE" : "READY"}
                  </Badge>
                  <span className={layer.status === "live" ? "font-bold text-white" : "text-gray-400"}>
                    {idx + 1}. {layer.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-300">{layer.description}</span>
                </div>
              ))}
              <div className="mt-2 text-xs text-blue-300">
                <b>Note:</b> Every layer is functional and production-tested if you run it by itself! <br />
                The missing puzzle piece is making all layers work as an integrated pipeline—this is where you might come in!
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <Card className="flex-1 bg-black/50 border-purple-400/25 shadow-inner p-4">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-2xl mb-2">
                  <Zap className="w-6 h-6" />
                  Why NeuroLint?
                </div>
                <div className="text-sm text-gray-200 leading-relaxed">
                  <ul className="ml-4 list-disc space-y-1">
                    <li>All 6 fixing layers are complete—config, refactor, component, hydration, etc.</li>
                    <li>Users get blazing fast config upgrades and full safety tooling.</li>
                    <li>
                      <span className="font-bold text-purple-200">We need your architectural wizardry to fuse them into a single, seamless automation run for everyone!</span>
                    </li>
                  </ul>
                </div>
              </Card>
              <Card className="flex-1 bg-black/50 border-blue-400/25 shadow-inner p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-blue-300 font-semibold text-2xl mb-2">
                  <Users className="w-6 h-6" />
                  Technical Co-Founder Wanted
                </div>
                <div className="text-sm text-blue-100">
                  All engineering layers are functional—<span className="font-bold text-white">your challenge is to help us build the most robust orchestrator.</span> <br />
                  <b>Do you love integrating complex tools, debugging cross-layer logic, and making magic for thousands?</b> Let's chat.
                  <br />
                  <b>Email:</b> 
                  <a
                    href="mailto:founder@neurolint.com"
                    className="ml-1 underline hover:text-blue-400"
                  >
                    founder@neurolint.com
                  </a>
                  <br />
                  Or DM me on Product Hunt!
                </div>
                <Button
                  className="mt-4 w-full bg-gradient-to-r from-blue-700 to-purple-500 text-white"
                  onClick={() =>
                    window.open("mailto:founder@neurolint.com?subject=I can help with NeuroLint orchestration!", "_blank")
                  }
                >
                  Help Architect the Orchestrator
                </Button>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 text-center text-xs text-gray-400 max-w-2xl">
        Transparency: <span className="font-bold text-green-400">All 6 smart automation layers are already built.</span>
        <br />
        Only Layer 1 is live for everyone right now. <span className="text-blue-200 font-semibold">Want to enable all 6 as a seamless pipeline? We'd love your help!</span>
      </div>
    </div>
  );
}
