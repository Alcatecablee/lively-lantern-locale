
export function SiteFooter() {
  return (
    <footer className="w-full py-4 px-3 mt-auto bg-[#181921] border-t border-[#262633] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
      <div>
        &copy; {new Date().getFullYear()} NeuroLint. All rights reserved.
      </div>
      <div>
        Feedback?{" "}
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
