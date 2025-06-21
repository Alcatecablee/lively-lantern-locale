import { useState, useEffect } from 'react';
import { Activity, FileText, AlertTriangle, RefreshCw, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  analysesToday: number;
}

interface ActivityItem {
  id: string;
  created_at: string;
  action: string;
  user_id: string | null;
  user_email?: string;
}

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    analysesToday: 0
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (signed in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

      // Get analyses today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: analysesToday } = await supabase
        .from('analysis_projects')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        analysesToday: analysesToday || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);

      // First get activity logs
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('id, created_at, action, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) {
        console.error('Error fetching activity logs:', activityError);
        setActivities([]);
        return;
      }

      // Then get user emails for each activity
      const activitiesWithEmails: ActivityItem[] = [];

      for (const activity of activityData || []) {
        let user_email = 'Unknown User';

        if (activity.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', activity.user_id)
            .single();

          if (profileData?.email) {
            user_email = profileData.email;
          }
        }

        activitiesWithEmails.push({
          ...activity,
          user_email
        });
      }

      setActivities(activitiesWithEmails);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-gray-400">Monitor system performance and user activity</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Analyses Today</p>
              <p className="text-2xl font-bold text-white">{stats.analysesToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">System Health</p>
              <p className="text-2xl font-bold text-green-400">99.9%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Recent Activity</h3>
            <button
              onClick={fetchRecentActivity}
              className="text-gray-400 hover:text-white transition-colors p-2 touch-manipulation"
             aria-label="Button">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                  {activity.user_email?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">
                    {activity.user_email || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-400 break-words">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No recent activity found
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-6">System Health</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-white font-medium">API Status</span>
              </div>
              <span className="text-green-400 text-sm">Operational</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-white font-medium">Database</span>
              </div>
              <span className="text-green-400 text-sm">Healthy</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-white font-medium">Auth Service</span>
              </div>
              <span className="text-green-400 text-sm">Online</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-white font-medium">Storage</span>
              </div>
              <span className="text-yellow-400 text-sm">85% Used</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};