import React from 'react';
import { User, Key, Settings as SettingsIcon } from 'lucide-react';

type SettingsTab = 'profile' | 'api' | 'preferences';

interface SettingsNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export const SettingsNavigation: React.FC<SettingsNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'profile' as SettingsTab, name: 'Profile', icon: User },
    { id: 'api' as SettingsTab, name: 'API Keys', icon: Key },
    { id: 'preferences' as SettingsTab, name: 'Preferences', icon: SettingsIcon }
  ];

  return (
    <div className="w-64">
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button aria-label="Button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
