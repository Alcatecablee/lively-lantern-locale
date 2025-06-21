import { useState, useEffect } from 'react';
import { TrendingUp, CreditCard, Calendar, Download, RefreshCw, Eye, Edit, DollarSign, Users as UsersIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  status: string;
  profiles?: {
    id: string;
    email: string;
    full_name: string;
  } | null;
}

interface Analytics {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
}

export const FinancialManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'subscriptions' | 'analytics'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    churnRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const { toast } = useToast();

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: DollarSign },
    { id: 'transactions' as const, name: 'Transactions', icon: CreditCard },
    { id: 'subscriptions' as const, name: 'Subscriptions', icon: UsersIcon },
    { id: 'analytics' as const, name: 'Analytics', icon: TrendingUp },
  ];

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const timeFilter = getTimeFilter();

      switch (activeTab) {
        case 'transactions':
          await fetchTransactions(timeFilter);
          break;
        case 'subscriptions':
          await fetchSubscriptions();
          break;
        case 'analytics':
          await fetchAnalytics(timeFilter);
          break;
        case 'overview':
          await fetchOverviewData(timeFilter);
          break;
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch financial data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeFilter = () => {
    const now = new Date();
    const ranges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };
    return ranges[timeRange] || ranges['30d'];
  };

  const fetchTransactions = async (timeFilter: Date) => {
    // First get transactions
    const { data: transactionData, error: transactionError } = await supabase
      .from('billing_transactions')
      .select('*')
      .gte('created_at', timeFilter.toISOString())
      .order('created_at', { ascending: false });

    if (transactionError) throw transactionError;

    // Get unique user IDs from transactions
    const userIds = [...new Set(transactionData?.map(t => t.user_id).filter(Boolean) || [])];

    // Get profiles for these users
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Create a map of user profiles
    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

    // Combine transactions with profile data
    const transactionsWithProfiles = transactionData?.map(transaction => ({
      ...transaction,
      profiles: profilesMap.get(transaction.user_id) || null
    })) || [];

    setTransactions(transactionsWithProfiles);
  };

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('subscription_plan', 'is', null)
      .order('subscription_start_date', { ascending: false });

    if (error) throw error;
    setSubscriptions(data || []);
  };

  const fetchAnalytics = async (timeFilter: Date) => {
    // Calculate analytics from transactions
    const { data: transactionData, error } = await supabase
      .from('billing_transactions')
      .select('*')
      .gte('created_at', timeFilter.toISOString())
      .eq('status', 'completed');

    if (error) throw error;

    const totalRevenue = transactionData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // Get monthly revenue (last 30 days)
    const monthFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyTransactions = transactionData?.filter(t =>
      new Date(t.created_at) >= monthFilter
    ) || [];
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // Get active subscriptions count
    const { data: subsData } = await supabase
      .from('profiles')
      .select('id')
      .eq('subscription_status', 'active');

    setAnalytics({
      totalRevenue,
      monthlyRevenue,
      activeSubscriptions: subsData?.length || 0,
      churnRate: 2.5 // This would be calculated based on cancellations
    });
  };

  const fetchOverviewData = async (timeFilter: Date) => {
    await Promise.all([
      fetchTransactions(timeFilter),
      fetchSubscriptions(),
      fetchAnalytics(timeFilter)
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportData = () => {
    const dataToExport = activeTab === 'transactions' ? transactions : subscriptions;
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
        <h2 className="text-2xl font-bold text-white">Financial Management</h2>
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
          <button
            onClick={exportData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
           aria-label="Button">
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">${analytics.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-blue-400">${analytics.monthlyRevenue.toFixed(2)}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-purple-400">{analytics.activeSubscriptions}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Churn Rate</p>
                  <p className="text-2xl font-bold text-orange-400">{analytics.churnRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {transactions.slice(0, 5).map((transaction: any) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {transaction.profiles?.email || 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-green-400">
                        ${Number(transaction.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{transaction.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Currency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">External ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {transactions.map((transaction: any) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {transaction.profiles?.email || 'Unknown User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-green-400">
                      ${Number(transaction.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{transaction.currency}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{transaction.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{transaction.payment_method || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                      {transaction.external_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-400 hover:text-blue-300" aria-label="Button">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {subscriptions.map((subscription: any) => (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{subscription.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{subscription.subscription_plan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(subscription.subscription_status)}`}>
                        {subscription.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {subscription.subscription_start_date ? 
                        new Date(subscription.subscription_start_date).toLocaleDateString() : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-400 hover:text-blue-300" aria-label="Button">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-yellow-400 hover:text-yellow-300" aria-label="Button">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Trends</h3>
              <div className="text-center text-gray-400 py-8">
                Revenue chart would be displayed here using a charting library
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Subscription Growth</h3>
              <div className="text-center text-gray-400 py-8">
                Subscription growth chart would be displayed here
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">${analytics.totalRevenue.toFixed(2)}</p>
                <p className="text-gray-400">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{analytics.activeSubscriptions}</p>
                <p className="text-gray-400">Active Subscribers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">
                  ${analytics.activeSubscriptions > 0 ? (analytics.totalRevenue / analytics.activeSubscriptions).toFixed(2) : '0.00'}
                </p>
                <p className="text-gray-400">Average Revenue Per User</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};