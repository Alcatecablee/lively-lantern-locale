import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { PayPalProvider } from "@/components/payments/PayPalProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DemoModeNotice } from "@/components/DemoModeNotice";
import { analytics } from "@/utils/analytics";
import { performanceMonitor } from "@/utils/performanceMonitor";
import Index from "./pages/Index";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import DashboardPage from "./pages/DashboardPage";
import TeamPage from "./pages/TeamPage";
import NotFound from "./pages/NotFound";
import { Pricing } from "./pages/Pricing";
import { TransparentDev } from "./pages/TransparentDev";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize analytics and performance monitoring
    analytics.init();

    // Track page views
    analytics.trackPageView(window.location.pathname);

    // Record initial page load performance
    performanceMonitor.recordMetric('app_init', performance.now());

    // Track app startup
    analytics.track({
      action: 'app_startup',
      category: 'performance',
      label: 'initial_load'
    });

    // Cleanup on unmount
    return () => {
      performanceMonitor.cleanup();
    };
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <AuthProvider>
                <PayPalProvider>
                  <DemoModeNotice />
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/blog/:slug" element={<BlogPostPage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/team" element={<TeamPage />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/transparent-dev" element={<TransparentDev />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </PayPalProvider>
              </AuthProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;