import React from 'react';
// import { useCustomRules } from '@/hooks/useCustomRules';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  Users,
  Settings,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Eye,
  Edit,
  Trash,
  Copy,
  Mail,
  Activity,
  BarChart,
  FileCode,
  Clock,
  Zap,
  Crown,
  Calendar,
  TrendingUp,
  ArrowLeft
} from "lucide-react";

interface TeamAnalysisProject {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  shared_with_team: boolean;
  team_id?: string;
  analysis_results?: unknown;
  performer?: {
    full_name?: string;
    email?: string;
  };
}

const TeamDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    teams,
    currentTeam,
    setCurrentTeam,
    teamMembers,
    pendingInvitations,
    loading,
    fetchTeamMembers,
    fetchPendingInvitations,
    inviteTeamMember,
    removeTeamMember,
    updateMemberRole,
    canManageTeam,
    isTeamOwner,
    createTeam,
  } = useTeam();

  // const { rules: customRules, loading: rulesLoading } = useCustomRules();

  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'admin' | 'editor' | 'viewer'>('editor');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showInviteDialog, setShowInviteDialog] = React.useState(false);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = React.useState(false);
  const [newTeamName, setNewTeamName] = React.useState('');
  const [newTeamDescription, setNewTeamDescription] = React.useState('');
  const [teamProjects, setTeamProjects] = React.useState<TeamAnalysisProject[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState(false);
  const [monthlyAnalyses, setMonthlyAnalyses] = React.useState(0);

  React.useEffect(() => {
    if (currentTeam) {
      fetchTeamMembers(currentTeam.id);
      fetchPendingInvitations(currentTeam.id);
      fetchTeamProjects(currentTeam.id);
    }
  }, [currentTeam]);

  React.useEffect(() => {
    const fetchMonthlyAnalyses = async () => {
      if (currentTeam?.id) {
        try {
          const analyses = await getTeamMonthlyAnalyses(currentTeam.id);
          setMonthlyAnalyses(analyses);
        } catch (error) {
          console.error('Error fetching monthly analyses:', error);
          setMonthlyAnalyses(0);
        }
      }
    };

    fetchMonthlyAnalyses();
  }, [currentTeam?.id]);

  const fetchTeamProjects = async (teamId: string) => {
    setProjectsLoading(true);
    try {
      console.debug('🔍 Fetching team projects for team:', teamId);

      const { data: projects, error } = await supabase
        .from('analysis_projects')
        .select(`
          id,
          name,
          created_at,
          user_id,
          shared_with_team,
          team_id,
          analysis_results,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('team_id', teamId)
        .eq('shared_with_team', true)
        .order('created_at', { ascending: false });

      console.debug('📊 Team projects query result:', { data: projects, error });

      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.debug('🚫 analysis_projects table does not exist yet, using empty array');
          setTeamProjects([]);
          return;
        }
        throw error;
      }

      const mappedProjects = projects.map(project => ({
        ...project,
        performer: project.profiles
      }));

      console.debug('✅ Team projects loaded successfully:', mappedProjects);
      setTeamProjects(mappedProjects);
    } catch (error) {
      console.error('💥 Error fetching team projects:', error);

      // Don't show error toast if it's just missing tables - that's expected
      if (!error.message?.includes('relation') && !error.message?.includes('does not exist')) {
        toast({
          title: 'Error',
          description: 'Failed to load team projects. Please try again.',
          variant: 'destructive'
        });
      }

      // Set empty array as fallback
      setTeamProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!currentTeam || !inviteEmail.trim()) return;

    const success = await inviteTeamMember(currentTeam.id, inviteEmail.trim(), inviteRole);
    if (success) {
      setInviteEmail('');
      setInviteRole('editor');
      setShowInviteDialog(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentTeam) return;
    await removeTeamMember(currentTeam.id, userId);
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    if (!currentTeam) return;
    await updateMemberRole(currentTeam.id, userId, newRole);
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      // Use the createTeam hook function
      const newTeam = await createTeam({
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || undefined,
      });

      if (newTeam) {
        setNewTeamName('');
        setNewTeamDescription('');
        setShowCreateTeamDialog(false);
        setCurrentTeam(newTeam);
        toast({
          title: 'Success',
          description: 'Team created successfully!'
        });
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to create team. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'editor': return <Edit className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'editor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const teamStats = {
    totalMembers: teamMembers.length,
    monthlyAnalyses: monthlyAnalyses,
    activeProjects: teamProjects.length,
    customRules: 0 // Mock value since useCustomRules is disabled
  };

  if (loading) {
    return <div>Loading...</div>
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to Team Dashboard</h1>
          <p className="text-gray-400 mb-8">Get started by creating your first team</p>

          <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
            <DialogTrigger asChild>
              <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Team Name</label>
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="bg-[#262626] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
                  <Input
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder="Enter team description"
                    className="bg-[#262626] border-gray-700 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateTeamDialog(false)}
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button variant="default" onClick={handleCreateTeam} className="bg-purple-600 hover:bg-purple-700">
                    Create Team
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Team Dashboard</h1>
            <p className="text-gray-400">Manage your team and collaborate on code analysis</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select 
              value={currentTeam?.id || ''} 
              onValueChange={(value) => {
                const team = teams.find(t => t.id === value);
                if (team) setCurrentTeam(team);
              }}
            >
              <SelectTrigger className="w-64 bg-[#262626] border-gray-700 text-white">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-gray-700">
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <Plus className="h-4 w-4 mr-2" />
                  New Team
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Team Name</label>
                    <Input
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Enter team name"
                      className="bg-[#262626] border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
                    <Input
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                      placeholder="Enter team description"
                      className="bg-[#262626] border-gray-700 text-white"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateTeamDialog(false)}
                      className="border-gray-600 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button variant="default" onClick={handleCreateTeam} className="bg-purple-600 hover:bg-purple-700">
                      Create Team
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Team Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Members</p>
                  <p className="text-2xl font-bold text-white">{teamStats.totalMembers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Analyses</p>
                  <p className="text-2xl font-bold text-white">{teamStats.monthlyAnalyses}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Projects</p>
                  <p className="text-2xl font-bold text-white">{teamStats.activeProjects}</p>
                </div>
                <FileCode className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Custom Rules</p>
                  <p className="text-2xl font-bold text-white">{teamStats.customRules}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="space-y-6">
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#262626] border-gray-700">
            <TabsTrigger value="members" className="text-gray-300 data-[state=active]:text-white">Members</TabsTrigger>
            <TabsTrigger value="projects" className="text-gray-300 data-[state=active]:text-white">Projects</TabsTrigger>
            <TabsTrigger value="rules" className="text-gray-300 data-[state=active]:text-white">Custom Rules</TabsTrigger>
            <TabsTrigger value="analytics" className="text-gray-300 data-[state=active]:text-white">Analytics</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Team Members</CardTitle>
                    <CardDescription>
                      Manage team members and their permissions
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-[#262626] border-gray-700 text-white w-64"
                      />
                    </div>
                    {canManageTeam && (
                      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Invite Member
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1a1a] border-gray-800">
                          <DialogHeader>
                            <DialogTitle className="text-white">Invite Team Member</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <label className="text-sm font-medium text-gray-300">Email Address</label>
                              <Input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Enter email address"
                                className="bg-[#262626] border-gray-700 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-300">Role</label>
                              <Select value={inviteRole} onValueChange={(value: 'admin' | 'editor' | 'viewer') => setInviteRole(value)}>
                                <SelectTrigger className="bg-[#262626] border-gray-700 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#262626] border-gray-700">
                                  <SelectItem value="viewer">Viewer - Read only access</SelectItem>
                                  <SelectItem value="editor">Editor - Can edit and analyze</SelectItem>
                                  <SelectItem value="admin">Admin - Full team management</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => setShowInviteDialog(false)}
                                className="border-gray-600 text-gray-300"
                              >
                                Cancel
                              </Button>
                              <Button variant="default" onClick={handleInviteMember} className="bg-purple-600 hover:bg-purple-700">
                                Send Invitation
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers
                    .filter(member => 
                      !searchTerm || 
                      member.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      member.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((member) => (
                      <div 
                        key={member.user_id} 
                        className="flex items-center justify-between p-4 bg-[#262626] rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                            {member.profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {member.profile?.full_name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-gray-400">{member.profile?.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`px-2 py-1 text-xs ${getRoleBadgeColor(member.role)}`}>
                                <span className="flex items-center space-x-1">
                                  {getRoleIcon(member.role)}
                                  <span>{member.role}</span>
                                </span>
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Joined {new Date(member.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {canManageTeam && member.role !== 'owner' && (
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={member.role} 
                              onValueChange={(value: 'admin' | 'editor' | 'viewer') => handleUpdateRole(member.user_id, value)}
                            >
                              <SelectTrigger className="w-32 bg-[#1a1a1a] border-gray-600 text-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#262626] border-gray-700">
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                {isTeamOwner && <SelectItem value="admin">Admin</SelectItem>}
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRemoveMember(member.user_id)}
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-white mb-4">Pending Invitations</h3>
                    <div className="space-y-3">
                      {pendingInvitations.map((invitation) => (
                        <div 
                          key={invitation.id} 
                          className="flex items-center justify-between p-4 bg-[#262626] rounded-lg border border-gray-700 opacity-75"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                              <Mail className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{invitation.email}</p>
                              <p className="text-sm text-gray-400">Invitation pending</p>
                              <Badge className={`px-2 py-1 text-xs mt-1 ${getRoleBadgeColor(invitation.role)}`}>
                                {invitation.role}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              Sent {new Date(invitation.created_at).toLocaleDateString()}
                            </span>
                            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                              Resend
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Team Projects</CardTitle>
                <CardDescription>
                  Shared analysis projects within your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading team projects...</p>
                  </div>
                ) : teamProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <FileCode className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No team projects yet</p>
                    <p className="text-sm text-gray-500">Share your analysis projects with the team to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 bg-[#262626] rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center space-x-4">
                          <FileCode className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="font-medium text-white">{project.name}</p>
                            <p className="text-sm text-gray-400">
                              Shared by {project.performer?.full_name} on {' '}
                              {new Date(project.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Rules Tab */}
          <TabsContent value="rules">
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Team Custom Rules</CardTitle>
                <CardDescription>
                  Custom linting rules shared across your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentTeam?.subscription_plan !== 'enterprise' ? (
                  <div className="text-center py-8">
                    <Zap className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Custom rules require Enterprise plan</p>
                    <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                      Upgrade to Enterprise
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {0 === 0 ? (
                      <div className="text-center py-8">
                        <Zap className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">No custom rules created yet</p>
                        <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Custom Rule
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Mock data - no rules since useCustomRules is disabled */}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a1a] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Team Activity</CardTitle>
                  <CardDescription>Recent team analysis activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-white">Frontend Library analyzed</p>
                        <p className="text-xs text-gray-400">by Alice Johnson • 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <div>  
                        <p className="text-sm text-white">Custom rule created</p>
                        <p className="text-xs text-gray-400">by Bob Smith • 5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-white">Team member added</p>
                        <p className="text-xs text-gray-400">by You • 1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1a] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Usage Metrics</CardTitle>
                  <CardDescription>Team usage statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Monthly Analyses</span>
                        <span className="text-white">{teamStats.monthlyAnalyses}/1000</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(teamStats.monthlyAnalyses / 1000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Team Members</span>
                        <span className="text-white">{teamStats.totalMembers}/{currentTeam?.max_members}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(teamStats.totalMembers / (currentTeam?.max_members || 10)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamDashboard;