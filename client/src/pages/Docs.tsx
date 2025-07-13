
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Docs() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22242B] via-[#181921] to-[#16151a] text-gray-100 px-2 pt-2 pb-8 font-sans">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" onClick={() => navigate(-1)} className="px-3 py-2 rounded-lg">
            ← Back
          </Button>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            NeuroLint Docs & Guide
          </span>
        </div>
        <div className="rounded-xl bg-black/90 border border-[#292939] shadow-lg px-4 py-5 mt-2">
          <h2 className="text-xl font-bold mb-2">Meet <span className="text-purple-400">NeuroLint</span>: Effortless Code Cleanup & Modernization</h2>
          <p className="leading-relaxed mb-3">
            <b>NeuroLint</b> is your AI-powered toolkit to bring React/TypeScript codebases into the modern age—without the grind. Save hours, enforce best practices automatically, and bulletproof your codebase for scale.
          </p>
          <ul className="list-disc ml-5 mb-2">
            <li><b>Autofix, don’t just lint:</b> Cleans up code, modernizes patterns, and fixes the painful stuff automatically.</li>
            <li><b>Layered magic:</b> 4 “layers” scan and upgrade everything from config to accessibility, prop types to hydration bugs.</li>
            <li><b>CI-ready & safe:</b> Use as a dev tool, one-off fixer, or continuous guardrail on every commit.</li>
            <li><b>Contrib-friendly:</b> Patterns, layers, and safety features are easy to extend.</li>
          </ul>
          <div className="flex flex-wrap gap-2 my-4">
            <a href="https://github.com/Alcatecablee/neurolint/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="bg-black/80">View on GitHub</Button>
            </a>
            <a href="https://github.com/Alcatecablee/neurolint/wiki" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="bg-black/80">Wiki & API</Button>
            </a>
            <a href="mailto:founder@neurolint.com" target="_blank" rel="noopener noreferrer">
              <Button variant="default">Contact Us</Button>
            </a>
            <a href="/" >
              <Button variant="ghost">Back to App</Button>
            </a>
          </div>

          {/* Quick Start */}
          <h3 className="font-semibold text-lg mt-6 mb-1">🚀 Quick Start</h3>
          <ol className="list-decimal ml-6 text-sm mb-2">
            <li>Install dependencies.</li>
            <li>Run <code>npm run fix all</code>—automatic, layered code modernization in seconds.</li>
            <li>Use <code>npm run fix dry run</code> to preview changes, or apply a single layer (e.g., <code>npm run fix layer 3</code>).</li>
            <li>See detailed output, or plug into CI for auto-fixing on pull requests.</li>
          </ol>
          <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto mt-2 mb-2">
{`# Fix everything, fast
npm run fix all

# Preview, don’t apply
npm run fix dry run

# Just run a specific layer (e.g., component best practices)
npm run fix layer 3
`}
          </pre>

          {/* Layers Breakdown */}
          <h3 className="font-semibold text-lg mt-6 mb-1">🪜 Layered Autofixing: What Happens?</h3>
          <ul className="list-disc ml-5 text-sm mb-2">
            <li><b>Layer 1: Config++</b>—Updates TS/Next configs, package.json scripts, unlocks modern tooling.</li>
            <li><b>Layer 2: Code Patterns</b>—Cleans up HTML entities, removes noise, upgrades patterns & imports.</li>
            <li><b>Layer 3: Component Intelligence</b>—Fixes missing keys, adds accessibility, improves prop types, enforces best TSX hygiene.</li>
            <li><b>Layer 4: Hydration & SSR</b>—Guards against SSR bugs, hydration drift, unsafe localStorage—rock-solid for modern Next.js/React apps.</li>
          </ul>

          {/* Example Fixes */}
          <h3 className="font-semibold text-lg mt-6 mb-1">🛠️ Example Fixes (See It Work!)</h3>
          <ul className="list-disc ml-5 text-sm mb-2">
            <li>Converts <code>&quot; → "</code> and other HTML entities</li>
            <li>Adds missing <b>key</b> props to mapped components</li>
            <li>Modernizes <b>Button</b> and form patterns</li>
            <li>Protects <b>localStorage</b> calls for SSR-safety</li>
            <li>Adds <b>alt</b> to images and fixes accessibility snags</li>
            <li>Upgrades out-of-date configs automatically</li>
          </ul>
          {/* Mobile touch reminder */}
          <div className="bg-neutral-900/80 p-3 rounded-lg border border-neutral-700 my-4 flex flex-row items-center gap-3">
            <span className="font-bold text-blue-300">TIP:</span>
            <span className="text-xs text-gray-300">Touch-screen friendly, scrollable & usable on both mobile and desktop. Try gestures and thumb-zones!</span>
          </div>
          {/* How does it work? */}
          <h3 className="font-semibold text-lg mt-6 mb-1">💡 How NeuroLint Works (At a Glance)</h3>
          <ol className="list-decimal ml-6 text-sm mb-2">
            <li>Reads your codebase and applies AI + AST-powered logic in carefully designed “layers.”</li>
            <li>Detects, explains, and safely applies changes—never override code blindly.</li>
            <li>Validates output, keeps backups, supports dry runs, and guards the build!</li>
            <li>Each layer can be extended—add your own patterns or even new layers.</li>
          </ol>

          {/* For contributors */}
          <h3 className="font-semibold text-lg mt-6 mb-1">🤝 Want to Contribute?</h3>
          <ul className="list-disc ml-5 text-sm mb-2">
            <li>Extend a pattern or add a custom fix—see <code>src/lib/neurolint/layers/</code>.</li>
            <li>New ideas? PRs welcome! Document your change and ensure dry run passes.</li>
            <li>Need help? <a href="mailto:founder@neurolint.com" className="underline">Email or submit an issue</a>—let’s make codebases better, together.</li>
          </ul>
        </div>
        {/* Footer */}
        <div className="text-xs text-center text-gray-400 mt-6">
          NeuroLint is open source (MIT License), built as part of Taxfy-project.<br />
          Like it? Tell your team, star us on GitHub, or drop us feedback!
        </div>
      </div>
    </div>
  );
}
