import { useState, useEffect } from 'react';
import { LandingPage } from './LandingPage';
import { AnalysisResults } from './AnalysisResults';
import { AdminDashboard } from './AdminDashboard';
import { AuthPage } from './auth/AuthPage';
import { UserSettings } from './UserSettings';
import { UserDashboard } from './UserDashboard';
import { AnalyzerHeader } from './analyzer/AnalyzerHeader';
import { UploadSection } from './analyzer/UploadSection';
import { ActionBar } from './analyzer/ActionBar';
import { ThemeProvider } from './ThemeProvider';
import { EducationalSystemTest } from './EducationalSystemTest';
import { useAnalyzer } from '@/hooks/useAnalyzer';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import { analytics } from '@/utils/analytics';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { Database, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Warning: Potential circular dependency detected
// Consider refactoring to avoid circular imports

// Warning: Potential circular dependency detected
// Consider refactoring to avoid circular imports

// Warning: Potential circular dependency detected
// Consider refactoring to avoid circular imports

// Warning: Potential circular dependency detected
// Consider refactoring to avoid circular imports

// Warning: Potential circular dependency detected
// Consider refactoring to avoid circular imports

// Warning: Potential circular dependency detected
// Consider refactoring to avoid circular imports

// Warning: Potential circular dependency detected
// Consider refactoring to avoid circular imports

// Warning: Potential circular dependency detected
// Consider refactoring to avoid circular imports

type AppView = 'landing' | 'analyzer' | 'admin' | 'auth' | 'settings' | 'dashboard' | 'test-educational';

export const NeuroLint: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [showBanner, setShowBanner] = useState(false);
  const { user, isLoading, isAdmin } = useAuth();
  const { tablesExist } = useTeam();
  const {
    analysis,
    isAnalyzing,
    uploadedFiles,
    fixedFiles,
    handleFilesSelected,
    handleFixIssue,
    handleFixAll,
    downloadFixedFiles,
    resetAnalysis
  } = useAnalyzer();

  // Show banner if user is logged in but team tables don't exist
  useEffect(() => {
    if (user && tablesExist === false) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [user, tablesExist]);

  useEffect(() => {
    console.debug('NeuroLint render - currentView:', currentView, 'user:', !!user);

    // Track page view
    analytics.trackPageView(currentView);

    // Record performance metrics
    performanceMonitor.recordMetric('component_render', performance.now());
  }, [currentView, user]);

  const handleGetStarted = () => {
    console.debug('Get started clicked, user:', !!user);
    if (user) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('auth');
    }
  };

  const handleStartAnalysis = () => {
    console.debug('Start analysis clicked');
    setCurrentView('analyzer');
    resetAnalysis();
  };

  const handleBackToLanding = () => {
    console.debug('Back to landing clicked');
    setCurrentView('landing');
    resetAnalysis();
  };

  const handleBackToDashboard = () => {
    console.debug('Back to dashboard clicked');
    setCurrentView('dashboard');
    resetAnalysis();
  };

  const handleShowAdmin = () => {
    console.debug('Show admin clicked');
    if (isAdmin) {
      setCurrentView('admin');
    }
  };

  const handleShowAuth = () => {
    console.debug('Show auth clicked');
    setCurrentView('auth');
  };

  const handleShowSettings = () => {
    console.debug('Show settings clicked');
    setCurrentView('settings');
  };

  const handleShowDashboard = () => {
    console.debug('Show dashboard clicked');
    setCurrentView('dashboard');
  };

  const handleBackFromSettings = () => {
    console.debug('Back from settings clicked');
    setCurrentView('dashboard');
  };

  const handleAuthSuccess = () => {
    console.debug('Auth success, redirecting to dashboard');
    setCurrentView('dashboard');
  };

  const handleTestEducational = () => {
    console.debug('Test educational clicked');
    setCurrentView('test-educational');
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-foreground">Loading...</div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {/* Team Features Setup Banner */}
        {showBanner && (
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-blue-500/20">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">
                      <span className="font-medium">Team features available!</span> 
                      {' '}Apply database migrations to enable team collaboration, custom rules, and API access.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="default" size="sm"
                    onClick={() => window.open('/team', '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                  >
                    Setup Guide
                  </Button>
                  <button
                    onClick={() => setShowBanner(false)}
                    className="text-gray-400 hover:text-white p-1"
                    aria-label="Close banner"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show auth page */}
        {currentView === 'auth' && (
          <AuthPage 
            onBack={handleBackToLanding}
            onSuccess={handleAuthSuccess}
          />
        )}

        {/* Show admin dashboard */}
        {currentView === 'admin' && user && isAdmin && (
          <AdminDashboard onBack={handleBackToDashboard} />
        )}

        {/* Show user settings */}
        {currentView === 'settings' && user && (
          <UserSettings onBack={handleBackFromSettings} />
        )}

        {/* Show educational system test */}
        {currentView === 'test-educational' && (
          <div className="min-h-screen bg-background">
            <div className="p-6">
              <div className="mb-6">
                <Button 
                  variant="outline" 
                  onClick={handleBackToDashboard}
                  className="mb-4"
                >
                  ← Back to Dashboard
                </Button>
              </div>
              <EducationalSystemTest />
            </div>
          </div>
        )}

        {/* Show user dashboard - PRIORITY: This should render when user exists and currentView is dashboard */}
        {currentView === 'dashboard' && user && (
          <UserDashboard 
            onStartAnalysis={handleStartAnalysis}
            onShowSettings={handleShowSettings}
            onBackToHome={handleBackToLanding}
            onTestEducational={handleTestEducational}
          />
        )}

        {/* Show analyzer interface */}
        {currentView === 'analyzer' && user && (
          <div className="min-h-screen bg-background">
            <AnalyzerHeader 
              onBackToLanding={handleBackToDashboard}
              onShowAdmin={handleShowAdmin}
              onShowSettings={handleShowSettings}
              onShowDashboard={handleShowDashboard}
            />

            <div className="max-w-6xl mx-auto px-4 py-8">
              {/* Upload Section */}
              {!analysis && (
                <UploadSection
                  onFilesSelected={handleFilesSelected}
                  isAnalyzing={isAnalyzing}
                  uploadedFiles={uploadedFiles}
                />
              )}

              {/* Action Bar */}
              <ActionBar
                analysis={analysis}
                fixedFilesCount={fixedFiles.size}
                onUploadNew={resetAnalysis}
                onFixAll={handleFixAll}
                onDownloadFixed={downloadFixedFiles}
              />

              {/* Results */}
              {analysis && (
                <>
                  {console.debug('🎯 Rendering AnalysisResults with analysis:', analysis)}
                  <AnalysisResults analysis={analysis} onFixIssue={handleFixIssue} />
                </>
              )}

              {/* Debug Info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-gray-800 rounded-lg text-white text-sm">
                  <h4 className="font-bold mb-2">Debug Info:</h4>
                  <p>Analysis exists: {!!analysis ? 'Yes' : 'No'}</p>
                  <p>Is analyzing: {isAnalyzing ? 'Yes' : 'No'}</p>
                  <p>Uploaded files: {uploadedFiles.length}</p>
                  <p>Current view: {currentView}</p>
                  <p>User: {user?.email || 'None'}</p>
                  {analysis && (
                    <p>Total issues: {analysis.summary.totalIssues}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Redirect to auth if trying to access analyzer without login */}
        {currentView === 'analyzer' && !user && (
          <AuthPage 
            onBack={handleBackToLanding}
            onSuccess={handleAuthSuccess}
          />
        )}

        {/* Show landing page - DEFAULT: Show for landing view OR when no user and not in specific views */}
        {(currentView === 'landing' || 
          (!user && currentView !== 'auth' && currentView !== 'admin') ||
          (currentView === 'dashboard' && !user) ||
          (currentView === 'settings' && !user)) && (
          <LandingPage 
            onGetStarted={handleGetStarted} 
            onShowAdmin={handleShowAdmin}
            onShowDashboard={handleShowDashboard}
          />
        )}
      </div>
    </ThemeProvider>
  );
};