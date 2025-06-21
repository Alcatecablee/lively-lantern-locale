import React from 'react'
import { Play } from 'lucide-react'
interface QueryRunnerProps extends React.HTMLAttributes<HTMLDivElement> {}
  sqlQuery: string;
  setSqlQuery: (query: string) => void;
  queryResults: unknown;
  loading: boolean;
  onExecuteQuery: () => void;

export const QueryRunner: React.FC<QueryRunnerProps> = ({}
  sqlQuery,
  setSqlQuery,
  queryResults,
  loading,
  onExecuteQuery
}) => {
  return (;
    <div className="space-y-6"><div className="bg-gray-900 border border-gray-800 rounded-lg p-6"><h3 className="text-lg font-semibold text-white mb-4">SQL Query Runner</h3>
        <div className="space-y-4"><div><label className="block text-sm font-medium text-gray-300 mb-2">SQL Query</label>
            <textarea;
              value={sqlQuery};
              onChange={(e) => setSqlQuery(e.target.value)};
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono h-32"
              placeholder="SELECT * FROM profiles LIMIT 10;"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              ⚠️ Direct query execution is disabled for security reasons
            </div>
            <button
              onClick={onExecuteQuery}
              disabled={loading || !sqlQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
             aria-label="Button">
              <Play className="h-4 w-4" />
              <span>{loading ? 'Executing...' : 'Execute Query'}</span>
            </button>
          </div>
        </div>
      </div>

      {queryResults && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Query Results</h4>
          <div className="bg-gray-800 rounded-lg p-4 overflow-auto">
            <pre className="text-green-400 font-mono text-sm">
              {JSON.stringify(queryResults, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};