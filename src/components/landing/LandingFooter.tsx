
export function LandingFooter() {
  return (
    <footer id="contact" className="w-full py-6 px-3 mt-auto bg-[#181921] border-t border-[#262633] flex flex-col sm:flex-row items-center justify-between">
      <div className="text-xs text-gray-400 mb-2 sm:mb-0">
        &copy; {new Date().getFullYear()} NeuroLint. All rights reserved.
      </div>
      <div className="text-xs text-gray-300">
        Contact:{" "}
        <a
          href="mailto:founder@neurolint.com"
          className="underline hover:text-blue-400 transition-colors"
        >
          founder@neurolint.com
        </a>
      </div>
    </footer>
  );
}
