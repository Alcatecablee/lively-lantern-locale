
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LandingHero() {
  const navigate = useNavigate();

  return (
    <section className="w-full flex flex-col items-center justify-center py-12 px-3 sm:py-20 bg-gradient-to-br from-[#181921] to-[#22242B]">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-300 via-blue-400 to-blue-200 bg-clip-text text-transparent text-center leading-tight mb-4">
        AI-powered Drop-in <br className="hidden xs:block" />
        <span className="text-white">Code & Config Fixer</span>
      </h1>
      <div className="text-base sm:text-xl text-gray-300 font-medium mb-8 max-w-md text-center px-2">
        Instantly modernize configs and codebase—TypeScript, Next.js, and more—with a single upload.<br />Safe. Transparent. Powerful.
      </div>
      <Button
        className="w-full max-w-xs py-4 text-lg rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 mb-8 shadow-cursor-glass"
        onClick={() => navigate("/")}
        size="lg"
      >
        <ArrowRight className="mr-2" />
        Try NeuroLint Free
      </Button>
      <div className="w-full flex justify-center">
        <img
          src="/placeholder.svg"
          alt="Code transformation preview"
          className="rounded-xl border border-[#262633] shadow-lg max-w-xs md:max-w-lg"
          draggable={false}
        />
      </div>
    </section>
  );
}
