import React from 'react';
import { Zap, Upload, Download } from 'lucide-react';
import { ProjectAnalysis } from '@/types/analysis';

interface ActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  analysis: ProjectAnalysis | null;
  fixedFilesCount: number;
  onUploadNew: () => void;
  onFixAll: () => void;
  onDownloadFixed: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  analysis,
  fixedFilesCount,
  onUploadNew,
  onFixAll,
  onDownloadFixed
}) => {
  if (!analysis) return null;

  return (
    <div className="mb-6 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
      {/* Mobile Layout */}
      <div className="flex flex-col space-y-4 sm:hidden">
        <button
          onClick={onUploadNew}
          className="inline-flex items-center justify-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 rounded-lg"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload New Files
        </button>

        <div className="flex flex-col space-y-2">
          {fixedFilesCount > 0 && (
            <button
              onClick={onDownloadFixed}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Fixed Files ({fixedFilesCount})
            </button>
          )}

          {analysis.summary.autoFixableCount > 0 && (
            <button
              onClick={onFixAll}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Zap className="h-4 w-4 mr-2" />
              Fix All Auto-fixable ({analysis.summary.autoFixableCount})
            </button>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex justify-between items-center">
        <button
          onClick={onUploadNew}
          className="inline-flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 rounded-lg"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload New Files
        </button>

        <div className="flex items-center space-x-4">
          {fixedFilesCount > 0 && (
            <button
              onClick={onDownloadFixed}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Fixed Files ({fixedFilesCount})
            </button>
          )}

          {analysis.summary.autoFixableCount > 0 && (
            <button
              onClick={onFixAll}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Zap className="h-4 w-4 mr-2" />
              Fix All Auto-fixable ({analysis.summary.autoFixableCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};