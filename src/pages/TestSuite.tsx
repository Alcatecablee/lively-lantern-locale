import { TestRunner } from "@/components/neurolint/TestRunner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain, TestTube } from "lucide-react";

const TestSuite = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-8 bg-gradient-to-br from-[#22242B] via-[#181921] to-[#16151a] dark">
      <div className="w-full max-w-6xl flex flex-col sm:flex-row gap-2 justify-between items-center mb-5">
        <div className="font-extrabold text-2xl sm:text-3xl text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
          <span>🤯 NeuroLint is developer-extensible!</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/docs">
            <button className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition-colors active:scale-95 touch-manipulation">
              Technical Docs
            </button>
          </a>
          <a href="https://github.com/neurolint/neurolint" target="_blank" rel="noopener noreferrer">
            <button className="bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-purple-900 transition-colors active:scale-95 touch-manipulation">
              Contribute on GitHub
            </button>
          </a>
        </div>
      </div>
      <div className="mb-6 w-full max-w-2xl">
        <div className="bg-black/80 border border-[#292939] rounded-xl px-5 py-4 text-base text-gray-200 font-sans shadow">
          <b>Why get involved?</b> NeuroLint is a multi-layer, AI-powered codebase fixer built for true maintainability at scale.
          <span className="block sm:inline text-blue-400 mt-1">Read the <a href="/docs" className="underline hover:text-blue-300">Technical Docs</a> or <a href="https://github.com/neurolint/neurolint" className="underline hover:text-blue-300" target="_blank" rel="noopener noreferrer">contribute on GitHub</a>.</span>
        </div>
      </div>
      <Card className="w-full max-w-6xl bg-black/80 border border-[#292939] rounded-xl shadow-cursor-glass transition-all backdrop-blur-lg font-sans">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="tracking-tighter font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NeuroLint
            </span>
            <TestTube className="w-6 h-6 text-blue-400" />
            <span className="font-normal text-xl text-muted-foreground pl-2">
              Automated Test Suite
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <TestRunner />
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center text-muted-foreground text-sm font-sans max-w-2xl">
        <p>
          Automated testing suite for validating NeuroLint's 6-layer transformation pipeline. 
          Tests cover common React issues, HTML entity corruption, hydration problems, accessibility fixes, and more.
        </p>
      </div>
    </div>
  );
};

export default TestSuite;
