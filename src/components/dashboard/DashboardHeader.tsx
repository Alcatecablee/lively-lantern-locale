import React from 'react'
import { Upload, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { User } from '@supabase/supabase-js'

interface DashboardHeaderProps {
  user: User | null;
  onStartAnalysis: () => void;
  onShowSettings: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onStartAnalysis,
  onShowSettings
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-muted-foreground">
            Here's your NeuroLint activity overview
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="default" onClick={onStartAnalysis}>
            <Upload className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
          <Button
            onClick={onShowSettings}
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};