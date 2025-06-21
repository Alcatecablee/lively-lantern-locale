import React from 'react'
import { BarChart3, Activity, Clock, RefreshCw } from 'lucide-react'
interface UsageStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: {
    total_requests: number;
    requests_today: number;
    avg_response_time: number;
    success_rate: number;
  };
}

export const UsageStats: React.FC<UsageStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <span className="text-muted-foreground text-sm">Total Requests</span>
        </div>
        <p className="text-2xl font-bold text-card-foreground mt-2">{stats.total_requests}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-green-400" />
          <span className="text-muted-foreground text-sm">Today</span>
        </div>
        <p className="text-2xl font-bold text-card-foreground mt-2">{stats.requests_today}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-yellow-400" />
          <span className="text-muted-foreground text-sm">Avg Response</span>
        </div>
        <p className="text-2xl font-bold text-card-foreground mt-2">{stats.avg_response_time}ms</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4"><div className="flex items-center space-x-2"><RefreshCw className="h-5 w-5 text-purple-400" /><span className="text-muted-foreground text-sm">Success Rate</span>
        </div>
        <p className="text-2xl font-bold text-card-foreground mt-2">{stats.success_rate}%</p>
      </div>
    </div>
  );
};

          </RefreshCw>
          </Clock>
          </Activity>
          </BarChart3>