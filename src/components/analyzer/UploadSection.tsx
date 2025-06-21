import React from 'react'
import { FileText } from 'lucide-react'
import { FileUpload } from '@/components/FileUpload'

interface UploadSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesSelected: (files: File[]) => void;
  isAnalyzing: boolean;
  uploadedFiles: File[];
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onFilesSelected,
  isAnalyzing,
  uploadedFiles
}) => {
  return (
    <div className="max-w-2xl mx-auto mb-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Upload Your React Files
        </h2>
        <p className="text-lg sm:text-xl text-gray-300 px-4">
          Professional static analysis for React and TypeScript codebases with 6-layer deep inspection
        </p>
      </div>
      <FileUpload onFilesSelected={onFilesSelected} />
      {isAnalyzing && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-4 py-2 text-sm text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
            Running NeuroLint analysis on your codebase...
          </div>
        </div>
      )}
      {uploadedFiles.length > 0 && !isAnalyzing && (
        <div className="mt-8 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
          <h3 className="font-medium mb-2 flex items-center text-white">
            <FileText className="h-4 w-4 mr-2" />
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="text-sm text-gray-300 flex justify-between items-center py-1">
                <span className="truncate mr-2 flex-1">{file.name}</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
