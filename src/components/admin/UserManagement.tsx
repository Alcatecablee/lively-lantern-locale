import { useState, useEffect } from 'react';
import { UserPlus, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  last_sign_in_at: string | null;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'' | 'admin' | 'user'>('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitingUsers, setInvitingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.debug('Fetching users from database...');

      // Fetch profiles and roles separately (much simpler, no JOIN issues)
      const [profilesResponse, rolesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, email, full_name, status, last_sign_in_at')
          .order('email', { ascending: true }),
        supabase
          .from('user_roles')
          .select('user_id, role')
      ]);

      if (profilesResponse.error) {
        console.error('Error fetching profiles:', profilesResponse.error);
        throw profilesResponse.error;
      }

      if (rolesResponse.error) {
        console.error('Error fetching roles:', rolesResponse.error);
        // Don't throw - we can still show users without role info
        console.warn('Role fetch failed, will default all users to "user" role');
      }

      console.debug('Profiles data:', profilesResponse.data);
      console.debug('Roles data:', rolesResponse.data);

      // Create a roles lookup map
      const rolesMap = new Map();
      if (rolesResponse.data) {
        rolesResponse.data.forEach(roleData => {
          rolesMap.set(roleData.user_id, roleData.role);
        });
      }

      // Combine the data
      const processedUsers: User[] = (profilesResponse.data || []).map(profile => {
        const userRole = rolesMap.get(profile.id) || 'user';

        // Ensure status is one of the allowed values
        const userStatus = (['active', 'inactive', 'suspended'].includes(profile.status)) 
          ? profile.status as 'active' | 'inactive' | 'suspended'
          : 'active';

        return {
          id: profile.id,
          email: profile.email || 'No email',
          full_name: profile.full_name || 'N/A',
          role: userRole === 'admin' ? 'admin' : 'user',
          status: userStatus,
          last_sign_in_at: profile.last_sign_in_at
        };
      });

      console.debug('Processed users:', processedUsers);
      setUsers(processedUsers);

      toast({
        title: "Success",
        description: `Loaded ${processedUsers.length} users from database`,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users from database",
        variant: "destructive",
      });
      // Set empty array on error to avoid showing stale data
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      console.debug(`Changing role for user ${userId} to ${newRole}`);

      // Update or insert user role
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole 
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Update local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: newStatus // @ts-ignore
 } : user
      ));
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleSendInvitation = async (email: string) => {
    setInvitingUsers(prev => new Set(prev).add(email));
    try {
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitation sent to ${email}`,
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: `Failed to send invitation to ${email}`,
        variant: "destructive",
      });
    } finally {
      setInvitingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTermLower) ||
      user.full_name?.toLowerCase().includes(searchTermLower);

    const matchesRole = filterRole ? user.role === filterRole : true;
    const matchesStatus = filterStatus ? user.status === filterStatus : true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const resetInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmail('');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">User Management</h2>
          <p className="text-gray-400">Manage users, roles, and permissions ({users.length} total users)</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium touch-manipulation"
           aria-label="Button">
            Refresh
          </button>
          <button aria-label="Button"
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium touch-manipulation"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </button>
        </div>
      </div>

      {/* Search and Filters - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value // @ts-ignore
)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table - Mobile Responsive */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user.full_name || 'N/A'}</p>
                      <p className="text-gray-400 text-sm truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                        : 'bg-blue-900/50 text-blue-300 border border-blue-700'
                    }`}>
                      {user.role}
                    </span>

                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-900/50 text-green-300 border border-green-700'
                        : user.status === 'suspended'
                        ? 'bg-red-900/50 text-red-300 border border-red-700'
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Last sign-in: {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'
                    }
                  </div>

                  <div className="flex space-x-2">
                    <button aria-label="Button"
                      onClick={() => handleSendInvitation(user.email)}
                      disabled={invitingUsers.has(user.email)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 touch-manipulation"
                    >
                      {invitingUsers.has(user.email) ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2 inline" />
                          Invite
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm touch-manipulation"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>

                    <select
                      value={user.status || 'active'}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm touch-manipulation"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Sign-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                          : 'bg-blue-900/50 text-blue-300 border border-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-900/50 text-green-300 border border-green-700'
                          : user.status === 'suspended'
                          ? 'bg-red-900/50 text-red-300 border border-red-700'
                          : 'bg-gray-700/50 text-gray-300 border border-gray-600'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button aria-label="Button"
                        onClick={() => handleSendInvitation(user.email)}
                        disabled={invitingUsers.has(user.email)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 touch-manipulation"
                      >
                        {invitingUsers.has(user.email) ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2 inline" />
                            Invite
                          </>
                        )}
                      </button>
                      <div className="flex space-x-2 mt-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm touch-manipulation"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>

                        <select
                          value={user.status || 'active'}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm touch-manipulation"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Invite New User</h2>
            <p className="text-gray-400 mb-6">Enter the email address of the user you want to invite.</p>

            <input
              type="email"
              placeholder="User Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
            />

            <div className="flex justify-end space-x-4">
              <button
                onClick={resetInviteModal}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
               aria-label="Button">
                Cancel
              </button>
              <button aria-label="Button"
                onClick={() => {
                  handleSendInvitation(inviteEmail);
                  resetInviteModal();
                }}
                disabled={invitingUsers.has(inviteEmail)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 touch-manipulation"
              >
                {invitingUsers.has(inviteEmail) ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2 inline" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};