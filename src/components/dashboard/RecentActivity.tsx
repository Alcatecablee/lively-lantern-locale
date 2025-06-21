import React from 'react';
import { Activity, BarChart3, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecentActivity as ActivityType } from '@/types/dashboard';

interface RecentActivityProps {
  activities: ActivityType[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('analysis')) return <BarChart3 className="h-4 w-4" />;
    if (action.includes('file')) return <FileText className="h-4 w-4" />;
    if (action.includes('fix')) return <CheckCircle className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const formatActivityDetails = (details: unknown): string => {
    if (!details) return '';
    if (typeof details === 'string') return details;
    if (typeof details === 'object') {
      try {
        return JSON.stringify(details);
      } catch {
        return String(details);
      }
    }
    return String(details);
  };

  return (
    <Card className="bg-card border-border lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center">
          <Activity className="h-5 w-5 mr-2 text-green-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                </div>
                <Badge variant={activity.type === 'success' ? 'default' : 'secondary'}>
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No recent activity</p>
            <p className="text-sm text-muted-foreground">
              Start analyzing your React code to see activity here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};