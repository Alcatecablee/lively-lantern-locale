import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
export default function Landing() {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  return <div className="min-h-screen flex flex-col bg-[#191a1f] font-sans">
      <main className="flex-1 flex flex-col items-center w-full">
        {/* PH Badge and Hero Section */}
        <section className="w-full flex flex-col items-center justify-center pt-7 xs:pt-8 pb-2 px-3 sm:pt-12 bg-[#191a1f] relative">
          {/* PH Badge */}
          
          {/* LOGO */}
          <img src="/lovable-uploads/9491cce3-b317-4586-bcb1-fc0df07a440d.png" alt="NeuroLint logo" className="w-28 xs:w-32 h-auto mb-3 mt-8 sm:w-40 select-none pointer-events-none" draggable={false} loading="eager" />
          {/* Headline & Subheadline */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold text-white text-center leading-tight mb-3 animate-fade-in">
            <span className="block text-purple-300">Modernize any React/TS codebase</span>
            <span className="block text-white">with <span className="text-orange-400">1 click</span> — powered by AI</span>
          </h1>
          <div className="text-base sm:text-xl text-gray-300 font-medium mb-8 max-w-md text-center px-2 animate-fade-in">
            Drop in your project &ndash; NeuroLint cleans up, upgrades, and future-proofs it for real production work. <br />
            Fast, safe, and free for the PH community.
          </div>
          {/* Try on PH Button */}
          <Button className="w-full max-w-xs py-4 text-lg rounded-xl bg-[#ff624f] hover:bg-[#fa745e] mb-4 shadow-cursor-glass active:scale-98 transition-all touch-manipulation text-white border border-[#b64334]" onClick={() => navigate("/app")} size="lg" aria-label="Try NeuroLint Free from Product Hunt">
            <ArrowRight className="mr-2" />
            Try Now &mdash; Free for PH!
          </Button>
          {/* Demo or Screenshot Toggle */}
          <div className="w-full max-w-xs flex flex-col gap-2 items-center">
            <button onClick={() => setShowDemo(v => !v)} className="text-sm text-blue-300 underline underline-offset-2 rounded px-2 py-2 focus:outline-none hover:text-blue-200 transition-all" aria-label={showDemo ? "Hide demo" : "Show demo"}>
              {showDemo ? "Hide quick demo" : "See quick demo"}
            </button>
            {showDemo && <div className="w-full aspect-video bg-[#23233b] rounded-lg border border-[#262633] overflow-hidden shadow-lg animate-fade-in pointer-events-auto">
                {/* Placeholder Video/Screenshot. Replace src below with actual video if available. */}
                <video src="https://user-images.githubusercontent.com/1935696/155831920-caefd1ab-6c47-4ae6-8919-2d2532fa9927.mp4" className="w-full h-full object-cover" controls poster="/lovable-uploads/9491cce3-b317-4586-bcb1-fc0df07a440d.png" aria-label="Demo video of NeuroLint in action">
                  Sorry, your browser doesn't support embedded videos.
                </video>
              </div>}
          </div>
          {/* Micro testimonial */}
          <p className="text-xs text-gray-400 mt-4 max-w-sm text-center">
            &ldquo;Got an ancient project production-ready in under 2 minutes. Insanely fast.&rdquo; — PH beta tester
          </p>
        </section>
        {/* Features Grid */}
        <LandingFeatures />
      </main>
      {/* Community footer */}
      <LandingFooter />
    </div>;
}