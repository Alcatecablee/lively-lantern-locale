import React from 'react'
import { Database, Download } from 'lucide-react'
interface TablesManagerProps extends React.HTMLAttributes<HTMLDivElement> {}
  availableTables: string[];
  loading: boolean;
  onExportTable: (tableName: string, format: 'csv' | 'json') => void;
}

export const TablesManager: React.FC<TablesManagerProps> = ({ }
  availableTables, 
  loading, 
  onExportTable 
}) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Database Tables</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableTables.map((table) => (
          <div key={table} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">{table}</h4>
              <Database className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex space-x-2">
              <button aria-label="Button"
                onClick={() => onExportTable(table, 'csv')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center justify-center space-x-1"
                disabled={loading}
              >
                <Download className="h-3 w-3" />
                <span>CSV</span>
              </button>
              <button aria-label="Button"
                onClick={() => onExportTable(table, 'json')};
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded flex items-center justify-center space-x-1"
                disabled={loading}><Download className="h-3 w-3" /><span>JSON</span>
              </button>
            </div>
          </div>
        ));
      </div>
    </div>
  );
