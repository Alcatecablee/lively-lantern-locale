import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export type SubscriptionPlan = 'free' | 'pro' | 'team' | 'enterprise';

interface SubscriptionData {
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'cancelled' | 'trial';
  analysesThisMonth: number;
  analysesLimit: number;
  teamId?: string;
  customRulesEnabled: boolean;
  apiAccessEnabled: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: 'free',
    status: 'active',
    analysesThisMonth: 0,
    analysesLimit: 5,
    customRulesEnabled: false,
    apiAccessEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user profile with subscription info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // Handle case where profiles table doesn't exist or user doesn't have a profile
        console.debug('Profile error:', profileError);
        setSubscription(prev => ({ ...prev })); // Use defaults
        return;
      }

      // Count analyses this month - handle missing analysis_projects table
      let analysesThisMonth = 0;
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: analyses, error: analysesError } = await supabase
          .from('analysis_projects')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString());

        if (analysesError) {
          // If table doesn't exist, just use 0
          if (analysesError.message.includes('relation') && analysesError.message.includes('does not exist')) {
            analysesThisMonth = 0;
          } else {
            throw analysesError;
          }
        } else {
          analysesThisMonth = analyses?.length || 0;
        }
      } catch (err) {
        console.debug('Analysis count error:', err);
        analysesThisMonth = 0;
      }

      const plan = (profile?.subscription_plan as SubscriptionPlan) || 'free';
      const status = profile?.subscription_status || 'active';

      setSubscription({
        plan,
        status: status // @ts-ignore
,
        analysesThisMonth,
        analysesLimit: getAnalysesLimit(plan),
        customRulesEnabled: plan === 'enterprise',
        apiAccessEnabled: plan === 'enterprise',
      });

    } catch (error: any) {
      console.error('Error fetching subscription data:', error);
      // Don't show error toast for missing tables - it's expected
      if (!error.message?.includes('relation') || !error.message?.includes('does not exist')) {
        toast({
          title: 'Error',
          description: 'Failed to load subscription information',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getAnalysesLimit = (plan: SubscriptionPlan): number => {
    switch (plan) {
      case 'free': return 50; // Temporarily increased for debugging
      case 'pro': return -1; // unlimited
      case 'team': return -1; // unlimited
      case 'enterprise': return -1; // unlimited
      default: return 50; // Temporarily increased for debugging
    }
  };

  const canPerformAnalysis = (): boolean => {
    if (subscription.plan === 'free') {
      return subscription.analysesThisMonth < subscription.analysesLimit;
    }
    return true; // Paid plans have unlimited analyses
  };

  const checkFeatureAccess = (feature: string): boolean => {
    switch (feature) {
      case 'unlimited_analyses':
        return subscription.plan !== 'free';
      case 'team_collaboration':
        return subscription.plan === 'team' || subscription.plan === 'enterprise';
      case 'custom_rules':
        return subscription.plan === 'enterprise';
      case 'api_access':
        return subscription.plan === 'enterprise';
      case 'advanced_reporting':
        return subscription.plan === 'enterprise';
      case 'sso':
        return subscription.plan === 'enterprise';
      default:
        return true; // Basic features available to all
    }
  };

  const incrementAnalysisCount = async (): Promise<boolean> => {
    if (!canPerformAnalysis()) {
      toast({
        title: 'Analysis Limit Reached',
        description: `You've reached your monthly limit of ${subscription.analysesLimit} analyses. Upgrade to Pro for unlimited access.`,
        variant: 'destructive',
      });
      return false;
    }

    // Increment the count
    setSubscription(prev => ({
      ...prev,
      analysesThisMonth: prev.analysesThisMonth + 1
    }));

    return true;
  };

  const getRemainingAnalyses = (): number => {
    if (subscription.plan === 'free') {
      return Math.max(0, subscription.analysesLimit - subscription.analysesThisMonth);
    }
    return -1; // unlimited
  };

  const getUpgradeMessage = (feature: string): string => {
    switch (feature) {
      case 'unlimited_analyses':
        return 'Upgrade to Pro for unlimited code analyses';
      case 'team_collaboration':
        return 'Upgrade to Team plan for collaboration features';
      case 'custom_rules':
        return 'Upgrade to Enterprise for custom rules engine';
      case 'api_access':
        return 'Upgrade to Enterprise for API access';
      default:
        return 'Upgrade your plan to access this feature';
    }
  };

  return {
    subscription,
    loading,
    canPerformAnalysis,
    checkFeatureAccess,
    incrementAnalysisCount,
    getRemainingAnalyses,
    getUpgradeMessage,
    refreshSubscription: fetchSubscriptionData,
  };
}; 