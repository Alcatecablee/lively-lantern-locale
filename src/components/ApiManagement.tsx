import { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UsageStats } from './api/UsageStats';
import { ApiKeyForm } from './api/ApiKeyForm';
import { ApiKeysList } from './api/ApiKeysList';
import { ApiDocumentation } from './api/ApiDocumentation';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at?: string;
  usage_count: number;
  rate_limit_per_minute: number;
  is_active: boolean;
}

interface UsageStats {
  total_requests: number;
  requests_today: number;
  avg_response_time: number;
  success_rate: number;
}

export const ApiManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    total_requests: 0,
    requests_today: 0,
    avg_response_time: 0,
    success_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchApiKeys();
      fetchUsageStats();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      // Get usage statistics
      const { data: logs, error } = await supabase
        .from('api_usage_logs')
        .select('*')
        .eq('api_key_id', user?.id);

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const todayLogs = logs?.filter(log => 
        log.created_at?.startsWith(today)
      ) || [];

      const successfulRequests = logs?.filter(log => 
        log.status_code && log.status_code < 400
      ) || [];

      const avgResponseTime = logs?.reduce((sum, log) => 
        sum + (log.response_time_ms || 0), 0
      ) / (logs?.length || 1);

      setUsageStats({
        total_requests: logs?.length || 0,
        requests_today: todayLogs.length,
        avg_response_time: Math.round(avgResponseTime),
        success_rate: logs?.length ? Math.round((successfulRequests.length / logs.length) * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
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
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-card-foreground flex items-center">
          <Key className="h-5 w-5 mr-2" />
          API Keys
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your API keys for programmatic access</p>
      </div>

      <UsageStats stats={usageStats} />
      <ApiKeyForm onKeyCreated={fetchApiKeys} />
      <ApiKeysList apiKeys={apiKeys} onKeysChange={fetchApiKeys} />
      <ApiDocumentation />
    </div>
  );
};