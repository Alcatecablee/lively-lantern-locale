
import { Zap, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LAYERS = [
  {
    name: "ConfigMaster",
    description:
      "Modernizes TypeScript, Next.js, and package.json configs for maximum compatibility and best practices.",
    status: "live",
  },
  {
    name: "PatternCleanse",
    description:
      "Cleans and restructures code entities for maintainability and clarity.",
    status: "soon",
  },
  {
    name: "ReactRepair",
    description:
      "Improves React components with smart rewrites, import fixing, and missing key detection.",
    status: "soon",
  },
  {
    name: "HydraFix",
    description:
      "Detects and fixes hydration and SSR bugs for flawless React/Next.js deployments.",
    status: "soon",
  },
  {
    name: "NextGuard",
    description:
      "Enforces Next.js conventions and integrates optimization strategies automatically.",
    status: "soon",
  },
  {
    name: "TestReady",
    description:
      "Ensures components and configs are test-ready with basic static analysis.",
    status: "soon",
  },
];

export function LandingFeatures() {
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

        {/* Features Grid: LAYERS */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-8">
          {LAYERS.map((layer, idx) => (
            <div
              key={layer.name}
              className="flex items-center gap-3 p-3 rounded-lg bg-black/80 border border-[#292939] w-full"
            >
              <Badge
                variant={layer.status === "live" ? "default" : "secondary"}
                className={
                  layer.status === "live"
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }
              >
                {layer.status === "live" ? "LIVE" : "READY"}
              </Badge>
              <span
                className={
                  layer.status === "live"
                    ? "font-bold text-white"
                    : "text-gray-400"
                }
              >
                {idx + 1}. {layer.name}
              </span>
              <span className="ml-2 text-xs text-gray-300">
                {layer.description}
              </span>
            </div>
          ))}
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

