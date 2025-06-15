
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-black/80 border-b border-[#292939] backdrop-blur-lg px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Brain className="w-8 h-8 text-purple-400" aria-label="NeuroLint logo" />
        <span className="font-bold text-white text-2xl tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent select-none">NeuroLint</span>
      </div>
      <nav className="flex gap-4">
        <a href="#features" className="text-gray-300 hover:text-white font-medium transition-colors">Features</a>
        <a href="#how" className="text-gray-300 hover:text-white font-medium transition-colors">How it Works</a>
        <a href="#contact" className="text-gray-300 hover:text-white font-medium transition-colors">Contact</a>
      </nav>
      <a href="mailto:founder@neurolint.com?subject=I can help with NeuroLint orchestration!" className="ml-4">
        <Button className="bg-gradient-to-r from-blue-700 to-purple-500 text-white px-4 py-2 rounded-lg text-base shadow-md">
          Get Involved
        </Button>
      </a>
    </header>
  );
}
