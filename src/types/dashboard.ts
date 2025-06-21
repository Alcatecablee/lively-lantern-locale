
export interface DashboardStats {
  totalAnalyses: number;
  issuesFixed: number;
  filesProcessed: number;
  lastAnalysisDate: string | null;
}

export interface RecentActivity {
  id: string;
  action: string;
  details: unknown;
  created_at: string;
}
