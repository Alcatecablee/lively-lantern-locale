
import { ValidationTest } from "@/components/neurolint/ValidationTest";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TestTube, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ValidationTestPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-8 bg-gradient-to-br from-[#22242B] via-[#181921] to-[#16151a] dark">
      <div className="w-full max-w-6xl space-y-6">
        <Card className="bg-black/80 border border-[#292939] rounded-xl shadow-cursor-glass transition-all backdrop-blur-lg font-sans">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <TestTube className="w-6 h-6 text-blue-400" />
                <span className="tracking-tighter font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Validation Test
                </span>
              </CardTitle>
              <Link to="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
        
        <ValidationTest />
        
        <div className="text-center text-muted-foreground text-sm font-sans max-w-2xl mx-auto">
          <p>
            This test validates our recent fixes to the NeuroLint transformation pipeline, 
            specifically testing HTML entity decoding, JSX integrity validation, and AST transformation stability.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValidationTestPage;
