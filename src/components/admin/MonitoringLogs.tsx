import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Clock, Eye, Filter, Download, RefreshCw, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SystemLog {
  id: string;
  created_at: string;
  level: string;
  component: string;
  message: string;
  metadata: Record<string, any>;
}

interface PerformanceMetric {
  id: string;
  created_at: string;
  cpu_usage: number;
  memory_usage: number;
  response_time: number;
  active_connections: number;
}

interface ApiUsage {
  id: string;
  created_at: string;
  endpoint: string;
  method: string;
  status: number;
  response_time: number;
  user_id: string | null;
}

interface FilterState {
  timeRange: string;
  level: string;
  component: string;
}

export const MonitoringLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'performance' | 'api'>('overview');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    timeRange: '24h',
    level: 'all',
    component: 'all'
  });
  const { toast } = useToast();

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: Activity },
    { id: 'logs' as const, name: 'System Logs', icon: Eye },
    { id: 'performance' as const, name: 'Performance', icon: TrendingUp },
    { id: 'api' as const, name: 'API Usage', icon: Clock },
  ];

  const logLevels = ['all', 'error', 'warn', 'info', 'debug'];
  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const timeFilter = getTimeFilter();

      switch (activeTab) {
        case 'logs':
          await fetchSystemLogs(timeFilter);
          break;
        case 'performance':
          await fetchPerformanceMetrics(timeFilter);
          break;
        case 'api':
          await fetchApiUsage(timeFilter);
          break;
        case 'overview':
          await fetchOverviewData(timeFilter);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch monitoring data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeFilter = () => {
    const now = new Date();
    const ranges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    };
    return ranges[filter.timeRange] || ranges['24h'];
  };

  const fetchSystemLogs = async (timeFilter: Date) => {
    let query = supabase
      .from('system_logs')
      .select('*')
      .gte('created_at', timeFilter.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (filter.level !== 'all') {
      query = query.eq('level', filter.level);
    }

    if (filter.component !== 'all') {
      query = query.eq('component', filter.component);
    }

    const { data, error } = await query;
    if (error) throw error;
    setLogs(data || []);
  };

  const fetchPerformanceMetrics = async (timeFilter: Date) => {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .gte('created_at', timeFilter.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    setMetrics(data || []);
  };

  const fetchApiUsage = async (timeFilter: Date) => {
    const { data, error } = await supabase
      .from('api_usage_logs')
      .select('*')
      .gte('created_at', timeFilter.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    setApiUsage(data || []);
  };

  const fetchOverviewData = async (timeFilter: Date) => {
    await Promise.all([
      fetchSystemLogs(timeFilter),
      fetchPerformanceMetrics(timeFilter),
      fetchApiUsage(timeFilter)
    ]);
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warn': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'debug': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-800';
    if (status >= 400 && status < 500) return 'bg-orange-100 text-orange-800';
    if (status >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const exportLogs = () => {
    const dataToExport = activeTab === 'logs' ? logs : 
                        activeTab === 'performance' ? metrics : 
                        apiUsage;

    const csv = convertToCSV(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Monitoring & Logs</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
            aria-label="Button"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportLogs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
            aria-label="Button"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button aria-label="Button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">Filters:</span>
          </div>

          <select
            value={filter.timeRange}
            onChange={(e) => setFilter({ ...filter, timeRange: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          {(activeTab === 'logs') && (
            <select
              value={filter.level}
              onChange={(e) => setFilter({ ...filter, level: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm"
            >
              {logLevels.map((level) => (
                <option key={level} value={level}>
                  {level === 'all' ? 'All Levels' : level.toUpperCase()}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Errors</p>
                <p className="text-2xl font-bold text-red-400">
                  {logs.filter(log => log.level === 'error').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">API Requests</p>
                <p className="text-2xl font-bold text-blue-400">{apiUsage.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-green-400">
                  {apiUsage.length > 0 
                    ? Math.round(apiUsage.reduce((acc, usage) => acc + (usage.response_time_ms || 0), 0) / apiUsage.length)
                    : 0}ms
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">System Uptime</p>
                <p className="text-2xl font-bold text-purple-400">99.9%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* System Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Component</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {logs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getLogLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.component || '-'}</td>
                    <td className="px-6 py-4 text-sm text-white max-w-md truncate">{log.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.user_id || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Metric</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Component</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {metrics.map((metric: any) => (
                  <tr key={metric.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(metric.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{metric.metric_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-green-400">
                      {metric.metric_value}
                      {metric.metric_type === 'response_time' && 'ms'}
                      {metric.metric_type === 'memory_usage' && 'MB'}
                      {metric.metric_type === 'cpu_usage' && '%'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{metric.metric_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{metric.component || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Usage Tab */}
      {activeTab === 'api' && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">API Key</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {apiUsage.map((usage: any) => (
                  <tr key={usage.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(usage.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">
                      {usage.method}
                    </td>
                    <td className="px-6 py-4 text-sm text-white max-w-xs truncate">{usage.endpoint}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(usage.status_code)}`}>
                        {usage.status_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {usage.response_time_ms ? `${usage.response_time_ms}ms` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                      {usage.api_key_id?.substring(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringLogs;