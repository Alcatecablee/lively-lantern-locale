import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  onShowAdmin?: () => void;
  onShowDashboard?: () => void;
}

export const UserButton: React.FC<UserButtonProps> = ({ onShowAdmin, onShowDashboard }) => {
  const { user, signOut, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add debugging with more detail
  useEffect(() => {
    console.debug('UserButton render - user email:', user?.email);
    console.debug('UserButton render - user id:', user?.id);
    console.debug('UserButton render - isAdmin:', isAdmin);
    console.debug('UserButton render - isAdmin type:', typeof isAdmin);
    console.debug('UserButton render - onShowAdmin provided:', !!onShowAdmin);
    console.debug('UserButton render - should show admin button:', isAdmin && onShowAdmin);
    console.debug('UserButton render - isAdmin && onShowAdmin evaluation:', isAdmin && !!onShowAdmin);
  }, [user, isAdmin, onShowDashboard, onShowAdmin]);

  // Force check admin status for debugging
  const handleDebugAdminCheck = async () => {
    if (!user) return;
    console.debug('=== DEBUGGING ADMIN STATUS ===');
    console.debug('Current user:', user.email, user.id);
    console.debug('Current isAdmin state:', isAdmin);

    try {
      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
      console.debug('Direct RPC call result:', { data, error });
      console.debug('Should be admin:', !!data && !error);

      if (error) {
        console.debug('RPC Error details:', error.message);
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          console.debug('is_admin function does not exist - user is not admin');
        }
      }
    } catch (err) {
      console.error('Direct RPC call failed:', err);
      console.debug('This likely means the is_admin function is not created in the database');
    }
    console.debug('=== END DEBUG ===');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  const handleShowAdmin = () => {
    console.debug('Admin button clicked, isAdmin:', isAdmin);
    if (onShowAdmin) {
      onShowAdmin();
    }
    setShowDropdown(false);
  };

  const handleShowDashboard = () => {
    console.debug('Dashboard button clicked from UserButton');
    if (onShowDashboard) {
      onShowDashboard();
    } else {
      console.error('onShowDashboard handler is not available');
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button aria-label="Button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors min-h-[44px] touch-manipulation"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium hidden sm:block">
          {user.email?.split('@')[0]}
        </span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-sm text-gray-300 truncate">{user.email}</p>
            {isAdmin && <p className="text-xs text-blue-400">Admin Status: {String(isAdmin)}</p>}
            <p className="text-xs text-gray-500">Debug: isAdmin = {String(isAdmin)} ({typeof isAdmin})</p>
          </div>

          <div className="py-1">
            {/* Debug button - temporary */}
            <button
              onClick={handleDebugAdminCheck}
              className="w-full px-4 py-3 text-left text-sm text-yellow-400 hover:bg-gray-800 flex items-center space-x-2 transition-colors touch-manipulation"
             aria-label="Button">
              <span>🐛 Debug Admin Status</span>
            </button>

            {onShowDashboard && (
              <button
                onClick={handleShowDashboard}
                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center space-x-2 transition-colors touch-manipulation"
               aria-label="Button">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            )}

            {/* Enhanced admin button with debug info */}
            {isAdmin && onShowAdmin && (
              <button
                onClick={handleShowAdmin}
                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center space-x-2 transition-colors touch-manipulation"
               aria-label="Button">
                <Shield className="h-4 w-4" />
                <span>Admin Dashboard</span>
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center space-x-2 transition-colors touch-manipulation"
             aria-label="Button">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
