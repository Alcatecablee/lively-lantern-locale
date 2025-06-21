import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    let currentUserId: string | null = null;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.debug('Auth state change:', event, session);

        // Immediately reset admin state when user changes
        const newUserId = session?.user?.id || null;
        if (currentUserId !== newUserId) {
          console.debug('User changed from', currentUserId, 'to', newUserId, '- resetting admin state');
          currentUserId = newUserId;
          if (mounted) {
            setIsAdmin(false); // Always reset admin state first
          }
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Check admin status after setting user (non-blocking)
          checkAdminStatus(session.user.id);
        } else {
          if (mounted) {
            setIsAdmin(false);
          }
        }

        if (mounted) {
          setIsLoading(false); // Always set loading to false regardless of admin check
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;

      if (error) {
        console.error('Error getting session:', error);
      }

      // Set initial user and reset admin state
      const newUserId = session?.user?.id || null;
      currentUserId = newUserId;
      setSession(session);
      setUser(session?.user ?? null);
      setIsAdmin(false); // Always start with false

      if (session?.user) {
        // Check admin status (non-blocking)
        checkAdminStatus(session.user.id);
      }

      setIsLoading(false); // Always set loading to false
    });

    const checkAdminStatus = async (userId: string) => {
      try {
        console.debug('Checking admin status for user:', userId);

        // Use the security definer function to check admin status
        const { data, error } = await supabase
          .rpc('is_admin', { user_id: userId });

        console.debug('Admin check result:', { data, error, userId });

        if (mounted && currentUserId === userId) {
          const adminStatus = data === true;
          setIsAdmin(adminStatus);
          console.debug('User', userId, 'is admin:', adminStatus);
        } else {
          console.debug('Skipping admin status update - user changed or component unmounted');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Don't block the app if admin check fails
        if (mounted && currentUserId === userId) {
          setIsAdmin(false);
        }
      }
    };

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Reset admin state immediately when signing out
    setIsAdmin(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};