
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Settings, Mail } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  posts: Post[];
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

interface Post {
  id: number;
  title: string;
  content: string;
  tags: string[];
}

interface ComplexDashboardProps {
  initialUsers?: UserData[];
}

function ComplexDashboard({
  initialUsers = []
}: ComplexDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem('dashboard-theme') as 'light' | 'dark' : null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [mounted]);

  const handleUserAction = useCallback((userId: number, action: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const updatedUser = { ...user };
        if (action === 'toggle-notifications') {
          updatedUser.preferences.notifications = !user.preferences.notifications;
        }
        return updatedUser;
      }
      return user;
    }));
  }, []);

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem('dashboard-theme', newTheme);
    }
    document.body.className = newTheme;
  }, [theme]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" className="h-8 w-8" alt="Logo" />
              <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleThemeToggle}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200" 
                aria-label="Toggle theme"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button 
                className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600" 
                aria-label="Mail"
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src={user.avatar || '/default-avatar.png'} 
                  className="w-12 h-12 rounded-full" 
                  alt={`${user.name} avatar`} 
                />
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedUser(user)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View Details
                </button>
                
                <button
                  onClick={() => handleUserAction(user.id, 'toggle-notifications')}
                  className={`w-full px-4 py-2 rounded ${
                    user.preferences.notifications 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {user.preferences.notifications ? 'Notifications On' : 'Notifications Off'}
                </button>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Recent Posts ({user.posts.length})</h4>
                <div className="space-y-1">
                  {user.posts.slice(0, 3).map(post => (
                    <div key={post.id} className="text-sm text-gray-600 truncate">
                      {post.title}
                      <div className="flex space-x-1 mt-1">
                        {post.tags.map((tag, index) => (
                          <span key={`${post.id}-${tag}-${index}`} className="px-2 py-1 bg-gray-100 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Theme:</strong> {selectedUser.preferences.theme}</p>
                <p><strong>Notifications:</strong> {selectedUser.preferences.notifications ? 'Enabled' : 'Disabled'}</p>
                
                <div>
                  <h3 className="font-semibold mb-2">All Posts</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedUser.posts.map(post => (
                      <div key={post.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h4 className="font-medium">{post.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{post.content}</p>
                        <div className="flex space-x-1 mt-2">
                          {post.tags.map((tag, index) => (
                            <span key={`${post.id}-modal-${tag}-${index}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ComplexDashboard;
