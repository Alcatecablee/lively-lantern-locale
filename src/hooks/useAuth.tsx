import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UserData {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  plan_type: 'free' | 'pro' | 'enterprise';
  monthly_transformations_used: number;
  monthly_limit: number;
}

export function useAuth() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerkAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn && user) {
      syncUser();
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [isSignedIn, user]);

  const syncUser = async () => {
    if (!user) return;

    try {
      // First, try to get existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', user.id)
        .single();

      if (existingUser) {
        setUserData(existingUser as UserData);
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            full_name: user.fullName,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          toast({
            title: "Error",
            description: "Failed to create user account",
            variant: "destructive"
          });
        } else {
          setUserData(newUser as UserData);
        }
      }
    } catch (error) {
      console.error('Error syncing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const canUseTransformation = () => {
    if (!userData) return false;
    if (userData.plan_type !== 'free') return true;
    return userData.monthly_transformations_used < userData.monthly_limit;
  };

  const incrementUsage = async () => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('increment_monthly_usage', {
        clerk_user_id: user.id
      });

      if (!error && data) {
        // Refresh user data
        syncUser();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  return {
    isAuthenticated: isSignedIn,
    user: userData,
    clerkUser: user,
    loading,
    signOut,
    canUseTransformation,
    incrementUsage,
    syncUser,
  };
}
