import React from 'react';
import { BarChart3, FileText, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats as StatsType } from '@/types/dashboard';
import { UIErrorWrapper } from '@/components/ui/error-wrapper';

interface DashboardStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: StatsType;
  loading: boolean;
}

const DashboardStatsContent: React.FC<DashboardStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return <div>Loading stats...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Total Analyses
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">{stats.totalAnalyses}</div>
          <p className="text-xs text-muted-foreground">
            Files scanned and analyzed
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Issues Fixed
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">{stats.issuesFixed}</div>
          <p className="text-xs text-muted-foreground">
            Code improvements made
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Files Processed
          </CardTitle>
          <FileText className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">{stats.filesProcessed}</div>
          <p className="text-xs text-muted-foreground">
            React files analyzed
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Last Analysis
          </CardTitle>
          <Clock className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">
            {stats.lastAnalysisDate ? 
              formatDate(stats.lastAnalysisDate).split(',')[0] : 
              'Never'}
          </div>
          <p className="text-xs text-muted-foreground">
            Most recent scan
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const DashboardStats: React.FC<DashboardStatsProps> = (props) => {
  return (
    <UIErrorWrapper name="Dashboard Stats">
      <DashboardStatsContent {...props} />
    </UIErrorWrapper>
  );
};