import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AppPage from "./pages/AppPage";
import TestSuite from "./pages/TestSuite";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Docs from "./pages/Docs";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <SiteHeader />
        <div className="flex flex-col min-h-screen">
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/app" element={<AppPage />} />
              <Route path="/test" element={<TestSuite />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <SiteFooter />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
