
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#22242B] via-[#181921] to-[#16151a] font-sans">
      <main className="flex-1 flex flex-col">
        <LandingHero />
        <LandingFeatures />
      </main>
    </div>
  );
}
