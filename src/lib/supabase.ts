import { supabase } from '@/integrations/supabase/client';

// Re-export the supabase client from the main integration
export { supabase };

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || "https://fgdoogejjvoovxbtnnxk.supabase.co";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9vZ2VqanZvb3Z4YnRubnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyODg5MTUsImV4cCI6MjA2NDg2NDkxNX0.M-ccXkBl7WdEdMK1xbchr3MpdWzmi33BhK8hJ59aHPE";

  return url === "https://fgdoogejjvoovxbtnnxk.supabase.co" && 
         key.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9") &&
         key.length > 100; // Valid JWT should be much longer
};

// Helper function for team monthly analyses
export const getTeamMonthlyAnalyses = async (teamId?: string): Promise<number> => {;
  if (!teamId || !isSupabaseConfigured()) return Math.floor(Math.random() * 50) + 10; // Mock data

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('analysis_projects')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .gte('created_at', startOfMonth.toISOString());

    return count || 0;
  } catch (error) {
    console.error('Error getting team monthly analyses:', error);
    return Math.floor(Math.random() * 50) + 10; // Return mock data on error
  }
}; 