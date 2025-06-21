import React from 'react';
import { Activity, Users, FileCode, Clock } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => (
  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-blue-600/10 rounded-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-300">{title}</h3>
        <div className="mt-1 text-3xl font-bold">{value}</div>
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      </div>
    </div>
  </div>
);

export const TransparentDev = () => {
  return (
    <div className="min-h-screen bg-black text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Transparent Development</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We believe in complete transparency. Here's a real-time look at our development metrics,
            user statistics, and system performance.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <StatCard
            title="Active Users"
            value="10,000+"
            description="Developers using NeuroLint"
            icon={<Users className="h-6 w-6 text-blue-500" />}
          />
          <StatCard
            title="Files Analyzed"
            value="250,000+"
            description="Code quality improved daily"
            icon={<FileCode className="h-6 w-6 text-green-500" />}
          />
          <StatCard
            title="Hours Saved"
            value="500+"
            description="Development time optimized"
            icon={<Clock className="h-6 w-6 text-purple-500" />}
          />
          <StatCard
            title="System Uptime"
            value="99.9%"
            description="Last 30 days"
            icon={<Activity className="h-6 w-6 text-red-500" />}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Updates */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Recent Updates</h2>
            <div className="space-y-6">
              {[
                {
                  date: 'March 15, 2024',
                  title: 'Enhanced TypeScript Analysis',
                  description: 'Improved type checking and better handling of complex TypeScript patterns.'
                },
                {
                  date: 'March 10, 2024',
                  title: 'New Security Rules',
                  description: 'Added 15 new security rules for React applications.'
                },
                {
                  date: 'March 5, 2024',
                  title: 'Performance Optimization',
                  description: 'Reduced analysis time by 40% for large codebases.'
                }
              ].map((update, index) => (
                <div key={index} className="border-l-2 border-blue-500 pl-4">
                  <div className="text-sm text-gray-400">{update.date}</div>
                  <div className="font-medium mt-1">{update.title}</div>
                  <div className="text-sm text-gray-300 mt-1">{update.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">System Status</h2>
            <div className="space-y-4">
              {[
                { name: 'API Response Time', value: '45ms', status: 'Excellent' },
                { name: 'Analysis Engine', value: '99.99%', status: 'Operational' },
                { name: 'Database', value: '99.99%', status: 'Operational' },
                { name: 'Web Interface', value: '100%', status: 'Operational' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-gray-400">{service.value}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-300">{service.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};