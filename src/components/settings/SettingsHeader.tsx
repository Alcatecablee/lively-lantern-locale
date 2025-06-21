import React from 'react'
import { ArrowLeft } from 'lucide-react'

interface SettingsHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onBack?: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ onBack }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-4 mb-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Button"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        )}
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
      <p className="text-muted-foreground">Manage your account settings and preferences</p>
    </div>
  );
};
