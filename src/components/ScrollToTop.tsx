
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * On every route change, scrolls the window to the top of the page.
 * Mobile-first: also closes mobile keyboards by blurring input.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    // Mobile UX: try to blur any focused element (like an input) on navigation
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [pathname]);
  return null;
}
