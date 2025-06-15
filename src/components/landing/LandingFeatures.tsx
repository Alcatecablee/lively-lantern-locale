
import { Zap, Users, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const LAYERS = [
  {
    name: "ConfigMaster",
    description:
      "Modernizes TypeScript, Next.js, and package.json configs for maximum compatibility and best practices.",
    status: "live",
    experimental: false,
  },
  {
    name: "PatternCleanse",
    description:
      "Cleans and restructures code entities for maintainability and clarity.",
    status: "soon",
    experimental: true,
  },
  {
    name: "ReactRepair",
    description:
      "Improves React components with smart rewrites, import fixing, and missing key detection.",
    status: "soon",
    experimental: true,
  },
  {
    name: "HydraFix",
    description:
      "Detects and fixes hydration and SSR bugs for flawless React/Next.js deployments.",
    status: "soon",
    experimental: true,
  },
  {
    name: "NextGuard",
    description:
      "Enforces Next.js conventions and integrates optimization strategies automatically.",
    status: "soon",
    experimental: true,
  },
  {
    name: "TestReady",
    description:
      "Ensures components and configs are test-ready with basic static analysis.",
    status: "soon",
    experimental: true,
  },
];

export function LandingFeatures() {
  // Store toggle state per experimental layer, but do *not* run code, demo only:
  const [experimentalStates, setExperimentalStates] = useState<Record<string, boolean>>({});

  const handleToggle = (name: string) => {
    setExperimentalStates((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <section
      id="features"
      className="w-full flex flex-col items-center py-10 px-2 bg-gradient-to-b from-[#181921] via-[#181921]/90 to-[#16151a]"
    >
      <div className="max-w-3xl w-full">
        {/* Features Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="text-purple-300" />
          Features & Roadmap
        </h2>

        {/* CALL TO ACTION FOR ENGINEERING COLLABORATORS */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 mb-7">
          <div className="flex items-center text-blue-400 text-base font-semibold">
            <Users className="mr-2" />
            <span>
              Engineer or AI researcher? Help build the world’s first fully-automated code refactoring platform!
            </span>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-700 to-purple-500 text-white text-base"
            asChild
          >
            <a
              href="mailto:founder@neurolint.com?subject=I want to help NeuroLint!"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Involved
            </a>
          </Button>
        </div>

        {/* Features Grid: LAYERS (with experimental toggles) */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-8">
          {LAYERS.map((layer, idx) => (
            <div
              key={layer.name}
              className="flex items-center gap-3 p-3 rounded-lg bg-black/80 border border-[#292939] w-full relative"
            >
              <Badge
                variant={layer.status === "live" ? "default" : "secondary"}
                className={
                  layer.status === "live"
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }
              >
                {layer.status === "live" ? "LIVE" : layer.experimental ? "EXPERIMENTAL" : "READY"}
              </Badge>
              {/* Name/Index */}
              <span
                className={
                  layer.status === "live"
                    ? "font-bold text-white"
                    : "text-gray-400"
                }
              >
                {idx + 1}. {layer.name}
              </span>
              <span className="ml-2 text-xs text-gray-300 flex-1">{layer.description}</span>
              {/* If experimental, show demo toggle */}
              {layer.experimental && (
                <label className="flex items-center gap-1 ml-1">
                  <input
                    type="checkbox"
                    className="form-checkbox rounded border-blue-400 focus:ring-2 focus:ring-blue-400 accent-purple-400 w-5 h-5"
                    checked={experimentalStates[layer.name] || false}
                    onChange={() => handleToggle(layer.name)}
                    disabled={true}
                  />
                  <span className="text-xs text-purple-400">Demo</span>
                </label>
              )}
              {/* Show warning on hover if experimental */}
              {layer.experimental && (
                <div className="absolute right-2 bottom-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" title="Experimental, not live!" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Experimental safety notice */}
        <div className="bg-yellow-900/90 border border-yellow-700 text-yellow-200 rounded-lg p-4 mb-6 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-300" />
          <div>
            <b>Experimental Layers:</b> The toggles above are for demonstration only.
            These features are not yet live or safe—real code will only be processed by the <span className="text-green-300 font-bold">ConfigMaster (LIVE)</span> layer.
            Want to help us ship these? <a href="mailto:founder@neurolint.com" className="underline text-blue-200">Join as a technical collaborator!</a>
          </div>
        </div>

        {/* Differentiators */}
        <h3 className="text-xl font-semibold text-purple-200 mb-2 mt-4 flex items-center gap-2">
          <Zap className="w-5 h-5" /> What makes NeuroLint different?
        </h3>
        <ul className="ml-5 list-disc space-y-1 text-sm text-purple-100">
          <li>
            <b>All 6 code-fixing layers are production-ready and powerful
              individually</b>
            : config, patterns, smart component repair, hydration/SSR, and more.
          </li>
          <li>
            Robust dry run, backup, safety, transparency, and per-layer commands.
          </li>
          <li>
            <span className="font-bold text-green-400">
              Seeking co-founder to master the orchestration—layers are solid, we need help integrating them for truly seamless, automated multi-layer repair!
            </span>
          </li>
        </ul>
      </div>

      {/* How it Works */}
      <div id="how" className="mt-12 max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-3 text-blue-300 flex items-center gap-2">
          <Users className="w-6 h-6" />
          How it Works
        </h2>
        <div className="bg-black/60 rounded-lg border border-[#262633] p-6 text-gray-200">
          <ol className="list-decimal ml-5 space-y-2 text-sm">
            <li>Upload your TypeScript/Next.js project or configs—no setup required.</li>
            <li>Select the AI layer(s) you want to run, including full-stack config upgrades.</li>
            <li>Preview and approve changes. Full dry run, transparency, and safety tooling always enabled.</li>
            <li>Enjoy a modernized, production-ready codebase in seconds. Advanced orchestrator coming soon.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
