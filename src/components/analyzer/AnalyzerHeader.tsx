import React from 'react'
import { ArrowLeft, Settings, Shield, LayoutDashboard } from 'lucide-react'
import { UserButton } from '../auth/UserButton'
interface AnalyzerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onBackToLanding: () => void;
  onShowAdmin?: () => void;
  onShowSettings?: () => void;
  onShowDashboard?: () => void;
}

export const AnalyzerHeader: React.FC<AnalyzerHeaderProps> = ({
  onBackToLanding,
  onShowAdmin,
  onShowSettings,
  onShowDashboard
}) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToLanding}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
           aria-label="Button">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="h-6 w-px bg-gray-700" />
          <h1 className="text-xl font-semibold text-white">React Code Analyzer</h1>
        </div>

        <div className="flex items-center space-x-4">
          {onShowDashboard && (
            <button
              onClick={onShowDashboard}
              className="flex items-center text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
             aria-label="Button">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </button>
          )}

          {onShowSettings && (
            <button
              onClick={onShowSettings}
              className="flex items-center text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
             aria-label="Button">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          )}

          <UserButton onShowAdmin={onShowAdmin} />
        </div>
      </div>
    </header>
  );
};