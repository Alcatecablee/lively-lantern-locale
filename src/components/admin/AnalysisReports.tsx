import { useState, useEffect } from 'react';
import { Download, Calendar, Filter, BarChart3, Users, TrendingUp, Search, RefreshCw } from 'lucide-react';

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  status: string;
  userId: string;
}

export const AnalysisReports: React.FC = () => {
  const [projects, setProjects] = useState<AnalysisProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<AnalysisProject[]>([]);
  const [users, setUsers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: '',
    dateTo: '',
    status: '',
    userId: ''
  });

  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalIssues: 0,
    avgIssuesPerProject: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, filters, searchTerm]);

  const fetchData = async () => {
    try {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('analysis_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch users for the projects
      const userIds = [...new Set(projectsData?.map(p => p.user_id) || [])];
      let usersMap = new Map();

      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (!usersError && usersData) {
          usersData.forEach(user => {
            usersMap.set(user.id, user);
          });
        }
      }

      // Enhance projects with user data
      const enhancedProjects = projectsData?.map(project => {;
        const user = usersMap.get(project.user_id);
        return {
          ...project,
          user_email: user?.email || 'Unknown',
          user_name: user?.full_name || user?.email || 'Unknown'
        };
      }) || [];

      // Fetch all users for filter dropdown
      const { data: allUsersData, error: allUsersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name', { ascending: true });

      if (allUsersError) throw allUsersError;

      setProjects(enhancedProjects);
      setUsers(allUsersData || []);
      calculateStats(enhancedProjects);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analysis reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projectsData: AnalysisProject[]) => {
    const totalProjects = projectsData.length;
    const completedProjects = projectsData.filter(p => p.status === 'completed').length;
    const totalIssues = projectsData.reduce((sum, p) => sum + (p.total_issues || 0), 0);
    const avgIssuesPerProject = totalProjects > 0 ? Math.round(totalIssues / totalProjects) : 0;

    setStats({
      totalProjects,
      completedProjects,
      totalIssues,
      avgIssuesPerProject
    });
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(project => 
        new Date(project.created_at) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(project => 
        new Date(project.created_at) <= new Date(filters.dateTo)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // User filter
    if (filters.userId) {
      filtered = filtered.filter(project => project.user_id === filters.userId);
    }

    setFilteredProjects(filtered);
    calculateStats(filtered);
  };

  const exportData = async (exportType: string) => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data', {
        body: {
          export_type: exportType,
          filters: {
            ...filters,
            search: searchTerm
          }
        }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `${exportType} data exported successfully`,
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Analysis Reports</h2>
          <p className="text-gray-400">View and export analysis project reports</p>
        </div>
        <div className="flex space-x-2">
          <button aria-label="Button"
            onClick={() => exportData('analysis_projects')}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? 'Exporting...' : 'Export Projects'}</span>
          </button>
          <button
            onClick={fetchData}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
           aria-label="Button">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
              <p className="text-gray-400">Total Projects</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.completedProjects}</p>
              <p className="text-gray-400">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalIssues}</p>
              <p className="text-gray-400">Total Issues</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.avgIssuesPerProject}</p>
              <p className="text-gray-400">Avg Issues/Project</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
            <select
              value={filters.userId}
              onChange={(e) => setFilters({...filters, userId: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Project</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">User</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Files</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Issues</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Created</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{project.name}</p>
                      {project.description && (
                        <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300">{project.user_name}</p>
                    <p className="text-gray-400 text-sm">{project.user_email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' ? 'bg-green-900 text-green-300' :
                      project.status === 'processing' ? 'bg-yellow-900 text-yellow-300' :
                      project.status === 'failed' ? 'bg-red-900 text-red-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{project.file_count || 0}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-300">
                      <span className="text-red-400">{project.critical_issues || 0}</span> / {project.total_issues || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-400 hover:text-blue-300 text-sm" aria-label="Button">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProjects.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No projects found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

            </FileText>
              </Search>
            </Users>
            </TrendingUp>
            </BarChart3>