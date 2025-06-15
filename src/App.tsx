import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TestSuite from "./pages/TestSuite";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SiteHeader />
        <div className="flex flex-col min-h-screen">
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/test" element={<TestSuite />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/docs" element={<import('./pages/Docs').then(m => m.default)} /> 
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
