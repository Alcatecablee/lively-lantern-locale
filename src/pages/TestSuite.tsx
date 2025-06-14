
import { TestRunner } from "@/components/neurolint/TestRunner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain, TestTube } from "lucide-react";

const TestSuite = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-8 bg-gradient-to-br from-[#22242B] via-[#181921] to-[#16151a] dark">
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
