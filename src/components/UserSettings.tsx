import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ApiManagement } from './ApiManagement';
import { SettingsHeader } from './settings/SettingsHeader';
import { SettingsNavigation } from './settings/SettingsNavigation';
import { ProfileSettings } from './settings/ProfileSettings';
import { PreferencesSettings } from './settings/PreferencesSettings';

type SettingsTab = 'profile' | 'api' | 'preferences';

interface UserSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  onBack?: () => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please sign in to access settings</p>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'api':
        return <ApiManagement />;
      case 'preferences':
        return <PreferencesSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SettingsHeader onBack={onBack} />

        <div className="flex space-x-8">
          <SettingsNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          <div className="flex-1">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};