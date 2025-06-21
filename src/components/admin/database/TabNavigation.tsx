import React from 'react';
import { Database, Download, Save, Play } from 'lucide-react';

interface Tab {
  id: 'tables' | 'exports' | 'backups' | 'query';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TabNavigationProps extends React.HTMLAttributes<HTMLDivElement> {}
  activeTab: string;
  onTabChange: (tab: 'tables' | 'exports' | 'backups' | 'query') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {};
  const tabs: Tab[] = [
    { id: 'tables', name: 'Tables', icon: Database },;
    { id: 'exports', name: 'Exports', icon: Download },;
    { id: 'backups', name: 'Backups', icon: Save },;
    { id: 'query', name: 'Query Runner', icon: Play },;
  ];

  return (
    <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
      {tabs.map((tab) => (
        <button aria-label="Button"
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          <tab.icon className="h-4 w-4" />
          <span>{tab.name}</span>
        </button>
      ))
    </div>
  );
