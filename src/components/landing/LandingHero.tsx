
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LandingHero() {
  const navigate = useNavigate();

  return (
    <section className="w-full flex flex-col items-center justify-center py-10 xs:py-12 px-3 sm:py-20 bg-[#191a1f]">
      {/* Main logo */}
      <img
        src="/lovable-uploads/9491cce3-b317-4586-bcb1-fc0df07a440d.png"
        alt="NeuroLint logo"
        className="w-32 h-auto mb-4 sm:w-40 select-none pointer-events-none"
        draggable={false}
        loading="eager"
      />
      <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold text-white text-center leading-tight mb-4">
        AI-powered Drop-in <br className="hidden xs:block" />
        <span className="text-purple-300">Code & Config Fixer</span>
      </h1>
      <div className="text-base sm:text-xl text-gray-300 font-medium mb-8 max-w-md text-center px-2">
        Instantly modernize configs and codebase—TypeScript, Next.js, and more—with a single upload.<br />Safe. Transparent. Powerful.
      </div>
      <Button
        className="w-full max-w-xs py-4 text-lg rounded-xl bg-[#292939] hover:bg-[#434455] mb-8 shadow-cursor-glass active:scale-98 transition-all touch-manipulation text-white border border-[#342d66]"
        onClick={() => navigate("/app")}
        size="lg"
      >
        <ArrowRight className="mr-2" />
        Try NeuroLint Free
      </Button>
    </section>
  );
}
