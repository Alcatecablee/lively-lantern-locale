
import { Link, useLocation } from "react-router-dom";

export function SiteHeader() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40 w-full bg-black/80 border-b border-[#292939] backdrop-blur-lg px-4 py-2 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
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
      </Link>
      <nav className="flex gap-2 sm:gap-4">
        <Link
          to="/app"
          className={`text-gray-300 hover:text-white font-medium transition-colors px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400
           ${location.pathname === "/app" ? "bg-[#22242B]" : ""}`}
        >
          Workflow
        </Link>
        <Link
          to="/landing"
          className={`text-gray-300 hover:text-white font-medium transition-colors px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400
           ${location.pathname === "/landing" || location.pathname === "/" ? "bg-[#22242B]" : ""}`}
        >
          Landing
        </Link>
        <Link
          to="/docs"
          className={`text-gray-300 hover:text-white font-medium transition-colors px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400
           ${location.pathname === "/docs" ? "bg-[#22242B]" : ""}`}
        >
          Docs
        </Link>
        <Link
          to="/test"
          className={`text-gray-300 hover:text-white font-medium transition-colors px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400
           ${location.pathname === "/test" ? "bg-[#22242B]" : ""}`}
        >
          Test Lab
        </Link>
      </nav>
    </header>
  );
}
