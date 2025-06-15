
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Docs() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22242B] via-[#181921] to-[#16151a] text-gray-100 px-2 pt-2 pb-8 font-sans">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" onClick={() => navigate(-1)} className="px-3 py-2">
            ← Back
          </Button>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            NeuroLint Technical Docs
          </span>
        </div>
        <div className="rounded-xl bg-black/90 border border-[#292939] shadow-lg px-4 py-5 mt-2">
          <h2 className="text-xl font-bold mb-2">Comprehensive Automated Fixing System</h2>
          <p>
            NeuroLint is a multi-layer automated code fixing system designed to detect and solve common issues in React/Next.js codebases. 
            It’s modular, fast, and ready to be extended by the engineering community.
          </p>
          <h3 className="mt-4 font-semibold text-base">🚀 Quick Start</h3>
          <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto mt-2">
{`# Run all fixes automatically
npm run fix all

# Preview what would be fixed (dry run)
npm run fix dry run

# Run with detailed output
npm run fix verbose

# Run individual layers
npm run fix layer 1  # Configuration fixes
npm run fix layer 2  # Pattern fixes
npm run fix layer 3  # Component fixes
npm run fix layer 4  # Hydration fixes`}
          </pre>
          <h3 className="mt-4 font-semibold">🔧 System Architecture</h3>
          <ul className="list-disc ml-5 mb-2">
            <li><b>Layer 1: Configuration Fixes</b> – Modernizes configs and dependencies.</li>
            <li><b>Layer 2: Bulk Pattern Fixes</b> – Cleans up code, solves HTML/entity/import issues.</li>
            <li><b>Layer 3: Component Specific Fixes</b> – Ensures React/TS component best practices.</li>
            <li><b>Layer 4: Hydration/SSR Fixes</b> – Guards against SSR errors, adds NoSSR patterns.</li>
          </ul>
          <h3 className="mt-4 font-semibold">📊 Usage Examples</h3>
          <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto mt-2">
{`# Preview changes without applying them
npm run fix dry run

# Skip specific layers
node scripts/fix master.js   skip layers 1,2

# Verbose output for debugging
npm run fix verbose`}
          </pre>
          <h3 className="mt-4 font-semibold">🛡️ Safety Features</h3>
          <ul className="list-disc ml-5 mb-2">
            <li>Dry Run Mode & backups</li>
            <li>Incremental, layer-by-layer execution</li>
            <li>Error recovery and build validation</li>
          </ul>
          <h3 className="mt-4 font-semibold">🎯 Common Fix Patterns</h3>
          <ul className="list-disc ml-5">
            <li><b>HTML Entities:</b> <code>{`&quot; → "`}</code></li>
            <li><b>Missing Key Props:</b> <code>{`<div> → <div key={item.id}>`}</code></li>
            <li><b>Button Variants:</b> <code>{`<Button> → <Button variant="default">`}</code></li>
            <li><b>TS Config:</b> <code>{`"target": "es5" → "target": "ES2020"`}</code></li>
            <li><b>SSR Guards:</b> <code>{`localStorage → typeof window !== "undefined" && localStorage`}</code></li>
          </ul>
          <h3 className="mt-4 font-semibold">📈 Performance</h3>
          <p>
            Each layer runs in seconds. Complete runs usually finish in under a minute, making this suitable for CI or local workflows.
          </p>
          <h3 className="mt-4 font-semibold">🔧 Customization and Contributing</h3>
          <ol className="list-decimal ml-6 mb-2">
            <li>Find the layer to extend or fix (see <b>src/lib/neurolint/layers/</b>).</li>
            <li>Add new logic or patterns as needed.</li>
            <li>Test with dry run and backup features.</li>
            <li>Submit a PR and update this documentation!</li>
          </ol>
          <div className="flex gap-3 mt-4 flex-wrap">
            <a href="https://github.com/neurolint/neurolint" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="bg-black/80">View on GitHub</Button>
            </a>
            <a href="https://github.com/neurolint/neurolint/wiki" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="bg-black/80">GitHub Wiki</Button>
            </a>
            <a href="mailto:founder@neurolint.com" target="_blank" rel="noopener noreferrer">
              <Button variant="default">Contact Maintainer</Button>
            </a>
            <a href="/" >
              <Button variant="ghost">Back to Home</Button>
            </a>
          </div>
        </div>
        <div className="text-xs text-center text-gray-400 mt-6">
          NeuroLint is part of the Taxfy-project. Open source, MIT License. <br />
          Need more info or want to join? <a href="mailto:founder@neurolint.com" className="underline">Email us!</a>
        </div>
      </div>
    </div>
  );
}
