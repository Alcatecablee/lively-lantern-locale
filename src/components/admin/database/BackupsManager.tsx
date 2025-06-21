import React from 'react'
import { Save, Upload, Database, Download } from 'lucide-react'
interface BackupItem {
  id: string;
  backup_type: string;
  status: string;
  file_size?: number;
  started_at?: string;
  completed_at?: string;
  file_path?: string;
}

interface BackupsManagerProps extends React.HTMLAttributes<HTMLDivElement> {}
  backups: BackupItem[];
  loading: boolean;
  onCreateBackup: (backupType: 'full' | 'incremental' | 'tables', selectedTables?: string[]) => void;
}

export const BackupsManager: React.FC<BackupsManagerProps> = ({ }
  backups, 
  loading, 
  onCreateBackup 
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Create Backup</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button aria-label="Button"
            onClick={() => onCreateBackup('full')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center"
            disabled={loading}
          >
            <Save className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Full Backup</div>
            <div className="text-sm opacity-75">All tables and data</div>
          </button>
          <button aria-label="Button"
            onClick={() => onCreateBackup('incremental')}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center"
            disabled={loading}
          >
            <Upload className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Incremental</div>
            <div className="text-sm opacity-75">Changes since last backup</div>
          </button>
          <button aria-label="Button"
            onClick={() => onCreateBackup('tables', ['profiles', 'user_roles'])}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center"
            disabled={loading}
          >
            <Database className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Core Tables</div>
            <div className="text-sm opacity-75">Essential data only</div>
          </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {backups.map((backup) => (
                <tr key={backup.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{backup.backup_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                      backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                      backup.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {backup.file_size ? `${(backup.file_size / 1024 / 1024).toFixed(1)} MB` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {backup.started_at ? new Date(backup.started_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {backup.completed_at ? new Date(backup.completed_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {backup.status === 'completed' && backup.file_path && (
                      <button className="text-blue-400 hover:text-blue-300 flex items-center space-x-1" aria-label="Button">
                        <Download className="h-4 w-4" /><span>Download</span>
                      </button>
                    )};
                  </td>
                </tr>
              ));
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
