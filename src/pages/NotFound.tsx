import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Home, ArrowLeft, Search, Zap, Users, BarChart3, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const popularPages = [
    {
      name: "Home",
      path: "/",
      icon: Home,
      description: "Return to the main page"
    },
    {
      name: "Features",
      path: "/#features",
      icon: Zap,
      description: "Explore our powerful features"
    },
    {
      name: "Demo",
      path: "/#demo",
      icon: FileCode,
      description: "Try our live demo"
    },
    {
      name: "Pricing",
      path: "/#pricing",
      icon: BarChart3,
      description: "View our pricing plans"
    },
    ...(user ? [{
      name: "Dashboard",
      path: "/dashboard",
      icon: BarChart3,
      description: "Access your dashboard"
    }, {
      name: "Team",
      path: "/team",
      icon: Users,
      description: "Manage your team"
    }] : [])
  ];

  const handleNavigation = (path: string) => {
    if (path.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(path.substring(1));
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <Helmet>
        <title>Page Not Found - NeuroLint</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]"></div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Number with Animation */}
            <div className="mb-8">
              <h1 className="text-9xl md:text-[12rem] font-black bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent leading-none animate-pulse">
                404
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Main Message */}
            <div className="mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Page Not Found
              </h2>
              <p className="text-lg text-gray-400 max-w-md mx-auto">
                The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
              </p>
              <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-[#1a1a1a] px-4 py-2 rounded-lg border border-gray-800">
                <Search className="h-4 w-4" />
                <span>Attempted path: <code className="text-red-400">{location.pathname}</code></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-16 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" onClick={() => navigate(-1)}
                className="bg-[#1a1a1a] border border-gray-700 text-white hover:bg-[#262626] transition-all duration-200"
                size="lg"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Go Back
              </Button>
              <Button variant="default" onClick={() => handleNavigation('/')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200"
                size="lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Popular Pages */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">
                Popular Pages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularPages.map((page) => (
                  <button
                    key={page.name}
                    onClick={() => handleNavigation(page.path)}
                    aria-label={`Navigate to ${page.name}`}
                    className="group p-4 bg-[#1a1a1a] border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-[#262626] transition-all duration-200 text-left"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-200">
                        <page.icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
                          {page.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {page.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Message */}
            <div className="mt-16 pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team or check our documentation.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-16 w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </>
  );
};

export default NotFound;