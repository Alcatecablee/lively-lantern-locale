import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, RecentActivity } from '@/types/dashboard';
import { User } from '@supabase/supabase-js';

export const useDashboardData = (user: User | null) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAnalyses: 0,
    issuesFixed: 0,
    filesProcessed: 0,
    lastAnalysisDate: null
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch analysis projects for the user
      const { data: projects, error: projectsError } = await supabase
        .from('analysis_projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch analysis results for file count
      const { data: results, error: resultsError } = await supabase
        .from('analysis_results')
        .select('project_id, file_name')
        .in('project_id', projects?.map(p => p.id) || []);

      if (resultsError) throw resultsError;

      // Fetch activity logs for recent activity
      const { data: activities, error: activitiesError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;

      // Calculate real stats from database
      const totalAnalyses = projects?.length || 0;
      const filesProcessed = results?.length || 0;
      const totalIssues = projects?.reduce((sum, project) => sum + (project.total_issues || 0), 0) || 0;
      const criticalIssues = projects?.reduce((sum, project) => sum + (project.critical_issues || 0), 0) || 0;
      const lastAnalysisDate = projects?.[0]?.created_at || null;

      setStats({
        totalAnalyses,
        issuesFixed: totalIssues - criticalIssues, // Issues found minus critical issues still remaining
        filesProcessed,
        lastAnalysisDate
      });

      setRecentActivity(activities || []);

      // If no activity exists, create a welcome activity
      if (!activities || activities.length === 0) {
        await createWelcomeActivity();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWelcomeActivity = async () => {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user?.id,
          action: 'User dashboard accessed',
          details: { message: 'Welcome to NeuroLint!' }
        });

      if (!error) {
        // Refresh activity after creating welcome message
        const { data: activities } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setRecentActivity(activities || []);
      }
    } catch (error) {
      console.error('Error creating welcome activity:', error);
    }
  };

  return { stats, recentActivity, loading, refreshData: fetchDashboardData };
};