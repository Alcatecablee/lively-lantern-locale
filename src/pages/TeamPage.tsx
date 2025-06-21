import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import TeamDashboard from '@/components/TeamDashboard';
import { AuthPage } from '@/components/auth/AuthPage';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Users, Database, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TeamPage = () => {
  const { user, isLoading } = useAuth();
  const { tablesExist, loading: teamLoading } = useTeam();
  const navigate = useNavigate();

  if (isLoading || teamLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage 
        onBack={() => navigate('/')}
        onSuccess={() => navigate('/team')}
      />
    );
  }

  // Show setup message if team tables don't exist
  if (tablesExist === false) {
    return (
      <>
        <Helmet>
          <title>Team Features Setup Required - NeuroLint</title>
          <meta name="description" content="Set up team collaboration features for NeuroLint" />
        </Helmet>

        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl mb-6">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-4">
                  Team Features Setup Required
                </h1>
                <p className="text-xl text-gray-400">
                  Enable powerful team collaboration features for NeuroLint
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 text-left">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Team Collaboration</h3>
                  <p className="text-gray-400 text-sm">
                    Share workspaces, manage team members, and collaborate on code analysis projects.
                  </p>
                </div>

                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 text-left">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Database className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Custom Rules Engine</h3>
                  <p className="text-gray-400 text-sm">
                    Create custom analysis rules, AST patterns, and automated fixes for your team.
                  </p>
                </div>

                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 text-left">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                    <ExternalLink className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">API Access</h3>
                  <p className="text-gray-400 text-sm">
                    Professional REST API with rate limiting and team-based authentication.
                  </p>
                </div>

                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 text-left">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <ArrowRight className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h3>
                  <p className="text-gray-400 text-sm">
                    Track team activity, usage analytics, and comprehensive reporting dashboards.
                  </p>
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 text-left mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-400" />
                  Database Setup Required
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    To enable team features, you need to apply the database migrations to your Supabase instance:
                  </p>
                  <div className="bg-[#0a0a0a] border border-gray-700 rounded-lg p-4">
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                      <li>Open your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Supabase dashboard</a></li>
                      <li>Navigate to <span className="text-cyan-400">SQL Editor</span></li>
                      <li>Run the migration file: <code className="text-purple-400">supabase/migrations/001_add_team_features.sql</code></li>
                      <li>Refresh this page to access team features</li>
                    </ol>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-amber-400">
                    <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                    <span>The migration file is already created in your project directory</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default" onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Check Setup Status
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // If tables exist, show the team dashboard
  return (
    <>
      <Helmet>
        <title>Team Dashboard - NeuroLint</title>
        <meta name="description" content="Manage your team collaboration and analysis projects" />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a]">
        <TeamDashboard />
      </div>
    </>
  );
};

export default TeamPage;