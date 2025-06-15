
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-black/80 border-b border-[#292939] backdrop-blur-lg px-4 py-2 flex items-center justify-between">
      {/* Brand with uploaded logo */}
      <div className="flex items-center gap-2">
        <img
          src="/lovable-uploads/e4414bf6-9b0f-4b32-812b-7ae83d8c6a85.png"
          alt="NeuroLint logo"
          className="w-9 h-9 sm:w-10 sm:h-10"
          draggable={false}
          loading="eager"
        />
        <span className="font-bold text-white text-2xl tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent select-none">
          NeuroLint
        </span>
      </div>
      {/* Navigation - large tap targets */}
      <nav className="flex gap-2 sm:gap-4">
        <a
          href="#features"
          className="text-gray-300 hover:text-white font-medium transition-colors px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Features
        </a>
        <a
          href="#how"
          className="text-gray-300 hover:text-white font-medium transition-colors px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          How it Works
        </a>
        <a
          href="#contact"
          className="text-gray-300 hover:text-white font-medium transition-colors px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Contact
        </a>
      </nav>
      <a
        href="mailto:founder@neurolint.com?subject=I can help with NeuroLint orchestration!"
        className="ml-2"
        tabIndex={-1}
      >
        <Button className="bg-gradient-to-r from-blue-700 to-purple-500 text-white px-4 py-2 rounded-lg text-base shadow-md active:scale-95 touch-manipulation">
          Get Involved
        </Button>
      </a>
    </header>
  );
}
