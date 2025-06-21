import { useState, useEffect } from 'react';
import { Lock, Eye, AlertTriangle, Download, RefreshCw, FileText, HardDrive, Calendar, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  created_at: string;
  user_id: string;
  action: string;
  resource: string;
  details: Record<string, any>;
}

interface SystemBackup {
  id: string;
  created_at: string;
  status: string;
  size: number;
  type: string;
  location: string;
}

type SecurityTab = 'audit' | 'privacy' | 'backups';

export const SecurityCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SecurityTab>('audit');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const { toast } = useToast();

  const tabs = [
    { id: 'audit' as const, name: 'Audit Logs', icon: Eye },
    { id: 'privacy' as const, name: 'Data Privacy', icon: Lock },
    { id: 'backups' as const, name: 'Backup & Recovery', icon: HardDrive },
  ];

  const timeRanges = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const timeFilter = getTimeFilter();

      switch (activeTab) {
        case 'audit':
          await fetchAuditLogs(timeFilter);
          break;
        case 'backups':
          await fetchBackups(timeFilter);
          break;
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch security data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeFilter = () => {
    const now = new Date();
    const ranges = {
      '1d': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    };
    return ranges[timeRange] || ranges['7d'];
  };

  const fetchAuditLogs = async (timeFilter: Date) => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', timeFilter.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    setAuditLogs(data || []);
  };

  const fetchBackups = async (timeFilter: Date) => {
    const { data, error } = await supabase
      .from('system_backups')
      .select('*')
      .gte('created_at', timeFilter.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    setBackups(data || []);
  };

  const exportAuditLogs = () => {
    const csv = convertToCSV(auditLogs);
    downloadCSV(csv, 'audit_logs_export.csv');
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => ;
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-800';
    if (action.includes('create') || action.includes('add')) return 'bg-green-100 text-green-800';
    if (action.includes('update') || action.includes('edit')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getBackupStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Security & Compliance</h2>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
           aria-label="Button">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
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

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Events</p>
                    <p className="text-xl font-bold text-white">{auditLogs.length}</p>
                  </div>
                  <Eye className="h-6 w-6 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">High Risk</p>
                    <p className="text-xl font-bold text-red-400">
                      {auditLogs.filter(log => log.action.includes('delete')).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Login Events</p>
                    <p className="text-xl font-bold text-green-400">
                      {auditLogs.filter(log => log.action.includes('login')).length}
                    </p>
                  </div>
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Data Changes</p>
                    <p className="text-xl font-bold text-yellow-400">
                      {auditLogs.filter(log => log.action.includes('update')).length}
                    </p>
                  </div>
                  <FileText className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </div>

            <button
              onClick={exportAuditLogs}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
             aria-label="Button">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {auditLogs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {log.user_id?.substring(0, 8) || 'System'}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {log.resource_type}
                        {log.resource_id && ` (${log.resource_id.substring(0, 8)}...)`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                        {log.old_values || log.new_values ? 'Data changed' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Data Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Data Privacy Controls</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-white">GDPR Compliance</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Data Retention Policy</span>
                    <span className="text-green-400">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Right to Erasure</span>
                    <span className="text-green-400">Implemented</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Data Portability</span>
                    <span className="text-green-400">Available</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Consent Management</span>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white">Security Measures</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Data Encryption</span>
                    <span className="text-green-400">AES-256</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Database Security</span>
                    <span className="text-green-400">RLS Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">API Security</span>
                    <span className="text-green-400">JWT + Rate Limiting</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Audit Logging</span>
                    <span className="text-green-400">Comprehensive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Data Processing Activities</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Legal Basis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Retention</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">User Registration</td>
                    <td className="px-6 py-4 text-sm text-gray-300">Account creation and management</td>
                    <td className="px-6 py-4 text-sm text-gray-300">Contract performance</td>
                    <td className="px-6 py-4 text-sm text-gray-300">Account lifetime + 30 days</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Analytics Data</td>
                    <td className="px-6 py-4 text-sm text-gray-300">Service improvement</td>
                    <td className="px-6 py-4 text-sm text-gray-300">Legitimate interest</td>
                    <td className="px-6 py-4 text-sm text-gray-300">13 months</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Payment Data</td>
                    <td className="px-6 py-4 text-sm text-gray-300">Billing and invoicing</td>
                    <td className="px-6 py-4 text-sm text-gray-300">Contract performance</td>
                    <td className="px-6 py-4 text-sm text-gray-300">7 years</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Backup & Recovery Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Backups</p>
                  <p className="text-2xl font-bold text-white">{backups.length}</p>
                </div>
                <HardDrive className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Successful</p>
                  <p className="text-2xl font-bold text-green-400">
                    {backups.filter(b => b.status === 'completed').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Last Backup</p>
                  <p className="text-lg font-bold text-purple-400">
                    {backups.length > 0 ? 
                      new Date(backups[0].created_at).toLocaleDateString() : 
                      'Never'
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Backup History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {backups.map((backup: any) => (
                    <tr key={backup.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(backup.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{backup.backup_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getBackupStatusColor(backup.status)}`}>
                          {backup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {backup.file_size ? `${(backup.file_size / 1024 / 1024).toFixed(1)} MB` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {backup.started_at && backup.completed_at ? 
                          `${Math.round((new Date(backup.completed_at).getTime() - new Date(backup.started_at).getTime()) / 1000)}s` : 
                          '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {backup.status === 'completed' && (
                          <button className="text-blue-400 hover:text-blue-300 flex items-center space-x-1" aria-label="Button">
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};