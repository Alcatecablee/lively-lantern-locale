import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { TabNavigation } from './database/TabNavigation';
import { TablesManager } from './database/TablesManager';
import { ExportsHistory } from './database/ExportsHistory';
import { BackupsManager } from './database/BackupsManager';
import { QueryRunner } from './database/QueryRunner';

export const DatabaseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tables' | 'exports' | 'backups' | 'query'>('tables');
  const [exports, setExports] = useState([]);
  const [backups, setBackups] = useState([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const availableTables = [
    'profiles', 'user_roles', 'analysis_projects', 'analysis_results',
    'activity_logs', 'announcements', 'feature_flags', 'pricing_plans',
    'billing_transactions', 'support_tickets', 'audit_logs', 'system_logs'
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'exports') {
        const { data, error } = await supabase
          .from('database_exports')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setExports(data || []);
      } else if (activeTab === 'backups') {
        const { data, error } = await supabase
          .from('system_backups')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBackups(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportTable = async (tableName: string, format: 'csv' | 'json' = 'csv') => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('export-data', {
        body: { export_type: tableName, format }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `${tableName} exported successfully`,
      });

      fetchData();
    } catch (error) {
      console.error('Error exporting table:', error);
      toast({
        title: "Error", 
        description: "Failed to export table",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (backupType: 'full' | 'incremental' | 'tables', selectedTables?: string[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('system_backups')
        .insert({
          backup_type: backupType,
          status: 'pending',
          tables_included: selectedTables || null,
          started_at: new Date().toISOString(),
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Backup job created successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      });
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return;

    try {
      setLoading(true);

      // For now, we'll show a message that query execution is not available
      // In a real implementation, you would need to create a secure RPC function
      toast({
        title: "Info",
        description: "Direct SQL query execution is not available for security reasons. Use the Supabase dashboard for manual queries.",
        variant: "default",
      });

      setQueryResults({ message: "Query execution temporarily disabled for security" });
    } catch (error) {
      console.error('Error executing query:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to execute query",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Database Management</h2>
      </div>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'tables' && (
        <TablesManager 
          availableTables={availableTables}
          loading={loading}
          onExportTable={exportTable}
        />
      )}

      {activeTab === 'exports' && (
        <ExportsHistory exports={exports} />
      )}

      {activeTab === 'backups' && (
        <BackupsManager 
          backups={backups}
          loading={loading}
          onCreateBackup={createBackup}
        />
      )}

      {activeTab === 'query' && (
        <QueryRunner 
          sqlQuery={sqlQuery}
          setSqlQuery={setSqlQuery}
          queryResults={queryResults}
          loading={loading}
          onExecuteQuery={executeQuery}
        />
      )}
    </div>
  );
};