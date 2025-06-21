import { useState } from 'react';
import { Users, FileText, Settings, BarChart3, Shield, ArrowLeft, Search, Bell, Database, Activity, DollarSign, MessageSquare, CreditCard, LayoutDashboard } from 'lucide-react';
import { DashboardOverview } from './admin/DashboardOverview';
import { UserManagement } from './admin/UserManagement';
import { ContentManagement } from './admin/ContentManagement';
import { DatabaseManagement } from './admin/DatabaseManagement';
import { MonitoringLogs } from './admin/MonitoringLogs';
import { FinancialManagement } from './admin/FinancialManagement';
import { PaymentGatewayManagement } from './admin/PaymentGatewayManagement';
import { SecurityCompliance } from './admin/SecurityCompliance';
import { CommunicationTools } from './admin/CommunicationTools';
import { AnalysisReports } from './admin/AnalysisReports';
import { SystemSettings } from './admin/SystemSettings';
import { NotificationDropdown } from './admin/NotificationDropdown';

type AdminSection = 'overview' | 'users' | 'content' | 'database' | 'monitoring' | 'financial' | 'payments' | 'security' | 'communication' | 'reports' | 'settings';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  const menuItems = [
    { id: 'overview' as AdminSection, name: 'Overview', icon: LayoutDashboard },
    { id: 'users' as AdminSection, name: 'Users', icon: Users },
    { id: 'content' as AdminSection, name: 'Content', icon: FileText },
    { id: 'database' as AdminSection, name: 'Database', icon: Database },
    { id: 'monitoring' as AdminSection, name: 'Monitoring', icon: Activity },
    { id: 'financial' as AdminSection, name: 'Financial', icon: DollarSign },
    { id: 'payments' as AdminSection, name: 'Payment Gateways', icon: CreditCard },
    { id: 'security' as AdminSection, name: 'Security', icon: Shield },
    { id: 'communication' as AdminSection, name: 'Communication', icon: MessageSquare },
    { id: 'reports' as AdminSection, name: 'Reports', icon: BarChart3 },
    { id: 'settings' as AdminSection, name: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'content':
        return <ContentManagement />;
      case 'database':
        return <DatabaseManagement />;
      case 'monitoring':
        return <MonitoringLogs />;
      case 'financial':
        return <FinancialManagement />;
      case 'payments':
        return <PaymentGatewayManagement />;
      case 'security':
        return <SecurityCompliance />;
      case 'communication':
        return <CommunicationTools />;
      case 'reports':
        return <AnalysisReports />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200"
               aria-label="Button">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <NotificationDropdown />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button aria-label="Button"
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 mt-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-white" />
                <span className="text-white font-medium">System Status</span>
              </div>
              <div className="text-blue-100 text-sm">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>API Status:</span>
                  <span>Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};