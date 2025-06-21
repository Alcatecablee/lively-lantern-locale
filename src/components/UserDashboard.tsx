import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardStats } from './dashboard/DashboardStats';
import { QuickActions } from './dashboard/QuickActions';
import { RecentActivity } from './dashboard/RecentActivity';
import { ProTips } from './dashboard/ProTips';

interface UserDashboardProps extends React.HTMLAttributes<HTMLDivElement> {
  onStartAnalysis: () => void;
  onShowSettings: () => void;
  onBackToHome?: () => void;
  onTestEducational?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onStartAnalysis,
  onShowSettings,
  onBackToHome,
  onTestEducational
}) => {
  const { user } = useAuth();
  const { stats, recentActivity, loading } = useDashboardData(user);

  console.debug('UserDashboard render - user:', !!user, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    console.debug('UserDashboard - No user found');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Please log in to access the dashboard.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back to Landing Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBackToHome}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <DashboardHeader 
          user={user}
          onStartAnalysis={onStartAnalysis}
          onShowSettings={onShowSettings}
        />

        <DashboardStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions 
            onStartAnalysis={onStartAnalysis}
            onShowSettings={onShowSettings}
            onTestEducational={onTestEducational}
          />

          <RecentActivity activities={recentActivity} />
        </div>

        <ProTips />
      </div>
    </div>
  );
};