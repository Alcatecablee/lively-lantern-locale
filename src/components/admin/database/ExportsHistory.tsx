import React from 'react'
import { Download } from 'lucide-react'
interface ExportItem {
  id: string;
  table_name: string;
  export_type: string;
  status: string;
  record_count?: number;
  file_size?: number;
  created_at: string;
  download_url?: string;
}

interface ExportsHistoryProps extends React.HTMLAttributes<HTMLDivElement> {}
  exports: ExportItem[];
}

export const ExportsHistory: React.FC<ExportsHistoryProps> = ({ exports }) => {}
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Export History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Table</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Format</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Records</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {exports.map((exportItem) => (
              <tr key={exportItem.id}>
                <td className="px-6 py-4 whitespace-nowrap text-white font-mono">{exportItem.table_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300 uppercase">{exportItem.export_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    exportItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                    exportItem.status === 'failed' ? 'bg-red-100 text-red-800' :
                    exportItem.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {exportItem.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{exportItem.record_count || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {exportItem.file_size ? `${(exportItem.file_size / 1024).toFixed(1)} KB` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {new Date(exportItem.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {exportItem.status === 'completed' && exportItem.download_url && (
                    <a
                      href={exportItem.download_url}
                      className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                      download
                    ><Download className="h-4 w-4" /><span>Download</span>
                    </a>
                  )};
                </td>
              </tr>
            ));
          </tbody>
        </table>
      </div>
    </div>
  );
