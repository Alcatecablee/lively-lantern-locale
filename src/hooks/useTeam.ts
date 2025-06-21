import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  subscription_plan: 'free' | 'team' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  max_members: number;
  settings: unknown;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  joined_at: string;
  teams?: Team;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  token: string;
  expires_at: string;
  created_at: string;
}

export const useTeam = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<unknown[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tablesExist, setTablesExist] = useState<boolean | null>(null);

  // Check if team tables exist in the database
  const checkTablesExist = async () => {
    if (!user || tablesExist !== null) return;

    try {
      console.debug('🔍 Checking if team tables exist...');

      // Try a simple query to see if tables exist
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .limit(1);

      console.debug('📊 Teams table query result:', { data, error });

      if (error) {
        console.debug('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });

        // If error contains "relation does not exist", tables aren't created
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.debug('🚫 Tables do not exist (relation error)');
          setTablesExist(false);
          return;
        }

        // Check for other common issues
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          console.debug('🔒 Permission/RLS issue, but tables likely exist');
          setTablesExist(true);
          return;
        }

        console.debug('⚠️ Unknown error, assuming tables exist');
        setTablesExist(true);
      } else {
        console.debug('✅ Tables exist and query successful');
        setTablesExist(true);
      }
    } catch (err) {
      console.debug('💥 Exception during table check:', err);
      setTablesExist(false);
    }
  };

  // Fetch user teams
  const fetchUserTeams = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.debug('🔄 Fetching user teams...');

      // Check if tables exist first
      const { data: testData, error: testError } = await supabase
        .from('teams')
        .select('id')
        .limit(1);

      console.debug('🧪 Test query result:', { data: testData, error: testError });

      // Only treat as "tables don't exist" if it's specifically a relation error
      if (testError && testError.message.includes('relation') && testError.message.includes('does not exist')) {
        console.debug('🚫 Tables genuinely do not exist, using mock data');
        const mockTeams = getMockTeams();
        setTeams(mockTeams);
        if (mockTeams.length > 0 && !currentTeam) {
          setCurrentTeam(mockTeams[0]);
          setUserRole(mockTeams[0].userRole);
        }
        setTablesExist(false);
        setLoading(false);
        return;
      }

      // For 500 errors or other issues, assume tables exist but there's a configuration problem
      if (testError) {
        console.debug('⚠️ Query failed but tables likely exist - RLS or permission issue');
        console.debug('Error details:', testError);
      }

      setTablesExist(true);

      const { data: teamMemberships, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams!inner (
            id,
            name,
            description,
            owner_id,
            subscription_plan,
            subscription_status,
            max_members,
            settings,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.debug('❌ Team membership query failed:', error);
        // For now, set empty teams array instead of mock data
        setTeams([]);
        setLoading(false);
        return;
      }

      const userTeams = teamMemberships?.map(tm => ({
        ...tm.teams,
        userRole: tm.role
      })) || [];

      console.debug('✅ Successfully fetched teams:', userTeams);
      setTeams(userTeams);

      if (userTeams.length > 0 && !currentTeam) {
        const firstTeam = userTeams[0];
        setCurrentTeam(firstTeam);
        setUserRole(firstTeam.userRole);
      }
    } catch (err: unknown) {
      console.error('💥 Exception in fetchUserTeams:', err);
      setTablesExist(true); // Assume tables exist, just permissions issue
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data function
  const getMockTeams = (): (Team & { userRole: string })[] => {
    return [
      {
        id: 'mock-team-1',
        name: 'Demo Team',
        description: 'A demonstration team for NeuroLint features',
        owner_id: user?.id || '',
        subscription_plan: 'team',
        subscription_status: 'active',
        max_members: 10,
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        userRole: 'admin'
      }
    ];
  };

  // Fetch team members
  const fetchTeamMembers = async (teamId: string) => {
    if (!user || tablesExist === false) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profile:profiles(id, email, full_name)
        `)
        .eq('team_id', teamId);

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (err: unknown) {
      console.error('Error fetching team members:', err);
      setTeamMembers([]);
    }
  };

  // Fetch pending invitations
  const fetchPendingInvitations = async (teamId: string) => {
    if (!user || tablesExist === false) return;

    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('team_id', teamId)
        .is('accepted_at', null);

      if (error) throw error;
      setPendingInvitations(data || []);
    } catch (err: unknown) {
      console.error('Error fetching pending invitations:', err);
      setPendingInvitations([]);
    }
  };

  // Invite team member
  const inviteTeamMember = async (teamId: string, email: string, role: 'admin' | 'editor' | 'viewer') => {
    if (!user || tablesExist === false) return false;

    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const { error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamId,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString(),
          invited_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${email}`,
      });

      await fetchPendingInvitations(teamId);
      return true;
    } catch (err: unknown) {
      console.error('Error inviting team member:', err);
      toast({
        title: "Failed to send invitation",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove team member
  const removeTeamMember = async (teamId: string, userId: string) => {
    if (!user || tablesExist === false) return false;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "Team member has been removed.",
      });

      await fetchTeamMembers(teamId);
      return true;
    } catch (err: unknown) {
      console.error('Error removing team member:', err);
      toast({
        title: "Failed to remove member",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Update member role
  const updateMemberRole = async (teamId: string, userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    if (!user || tablesExist === false) return false;

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: `Member role updated to ${newRole}`,
      });

      await fetchTeamMembers(teamId);
      return true;
    } catch (err: unknown) {
      console.error('Error updating member role:', err);
      toast({
        title: "Failed to update role",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Check if user can manage team
  const canManageTeam = (teamId: string) => {
    if (!user || !currentTeam || currentTeam.id !== teamId) return false;
    return userRole === 'admin' || currentTeam.owner_id === user.id;
  };

  // Check if user is team owner
  const isTeamOwner = (teamId: string) => {
    if (!user || !teams) return false;
    const team = teams.find(t => t.id === teamId);
    return team?.owner_id === user.id;
  };

  // Check if user can access team features (has subscription or team membership)
  const canAccessTeamFeatures = () => {
    if (tablesExist === false) return false;
    return teams.length > 0 || false; // Can be expanded with subscription checks
  };

  // Check if user has specific permission
  const hasPermission = (permission: 'read' | 'write' | 'admin') => {
    if (!userRole || tablesExist === false) return false;

    switch (permission) {
      case 'read':
        return ['viewer', 'editor', 'admin'].includes(userRole);
      case 'write':
        return ['editor', 'admin'].includes(userRole);
      case 'admin':
        return userRole === 'admin';
      default:
        return false;
    }
  };

  // Create a new team
  const createTeam = async (teamData: {
    name: string;
    description?: string;
    subscription_plan?: 'team' | 'enterprise';
  }) => {
    if (!user || tablesExist === false) {
      toast({
        title: "Team features not available",
        description: "Please apply the database migrations first.",
        variant: "destructive",
      });
      return null;
    }

    console.debug('🏗️ Creating team with data:', teamData);
    console.debug('👤 Current user:', user);
    console.debug('🔑 User ID:', user.id);

    setLoading(true);
    try {
      // Create team
      const teamInsertData = {
        name: teamData.name,
        description: teamData.description,
        owner_id: user.id,
        subscription_plan: teamData.subscription_plan || 'team',
        subscription_status: 'active',
        max_members: teamData.subscription_plan === 'enterprise' ? 50 : 10,
      };

      console.debug('📝 Team insert data:', teamInsertData);

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert(teamInsertData)
        .select()
        .single();

      if (teamError) {
        console.error('❌ Team creation error:', teamError);
        throw teamError;
      }

      console.debug('✅ Team created successfully:', team);

      // Add owner as admin member
      const memberInsertData = {
        team_id: team.id,
        user_id: user.id,
        role: 'admin',
      };

      console.debug('👥 Adding member data:', memberInsertData);

      const { error: memberError } = await supabase
        .from('team_members')
        .insert(memberInsertData);

      if (memberError) {
        console.error('❌ Member addition error:', memberError);
        throw memberError;
      }

      console.debug('✅ Member added successfully');

      await fetchUserTeams();

      toast({
        title: "Team created successfully",
        description: `${teamData.name} has been created.`,
      });

      return team;
    } catch (err: unknown) {
      console.error('💥 Error creating team:', err);
      toast({
        title: "Failed to create team",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Invite user to team
  const inviteUser = async (email: string, role: 'editor' | 'viewer' = 'editor') => {
    if (!user || !currentTeam || tablesExist === false) return null;

    if (!hasPermission('admin')) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to invite users.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: currentTeam.id,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${email}`,
      });

      return data;
    } catch (err: unknown) {
      console.error('Error inviting user:', err);
      toast({
        title: "Failed to send invitation",
        description: err.message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Remove team member
  const removeMember = async (userId: string) => {
    if (!user || !currentTeam || tablesExist === false) return false;

    if (!hasPermission('admin')) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to remove members.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', currentTeam.id)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchUserTeams();

      toast({
        title: "Member removed",
        description: "Team member has been removed.",
      });

      return true;
    } catch (err: unknown) {
      console.error('Error removing member:', err);
      toast({
        title: "Failed to remove member",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      checkTablesExist();
    }
  }, [user]);

  useEffect(() => {
    if (user && tablesExist === true) {
      fetchUserTeams();
    }
  }, [user, tablesExist]);

  return {
    teams,
    currentTeam,
    userRole,
    teamMembers,
    pendingInvitations,
    loading,
    error,
    tablesExist,
    canAccessTeamFeatures,
    hasPermission,
    fetchTeamMembers,
    fetchPendingInvitations,
    inviteTeamMember,
    removeTeamMember,
    updateMemberRole,
    canManageTeam,
    isTeamOwner,
    createTeam,
    inviteUser,
    removeMember,
    fetchUserTeams,
    setCurrentTeam,
  };
};