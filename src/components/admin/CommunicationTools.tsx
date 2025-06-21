import { useState, useEffect } from 'react';
import { MessageSquare, Plus, AlertCircle, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  created_at: string;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  content: string;
  status: string;
  priority: string;
  created_at: string;
  profiles?: {
    id: string;
    email: string;
    full_name: string;
  } | null;
}

type CommunicationTab = 'announcements' | 'emails' | 'support' | 'notifications';

export const CommunicationTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CommunicationTab>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | EmailTemplate | SupportTicket | null>(null);
  const { toast } = useToast();

  const tabs = [
    { id: 'announcements' as const, name: 'Announcements', icon: MessageSquare },
    { id: 'emails' as const, name: 'Email Templates', icon: Mail },
    { id: 'support' as const, name: 'Support Tickets', icon: AlertCircle },
    { id: 'notifications' as const, name: 'Notifications', icon: Mail },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'announcements':
          await fetchAnnouncements();
          break;
        case 'emails':
          await fetchEmailTemplates();
          break;
        case 'support':
          await fetchSupportTickets();
          break;
        case 'notifications':
          // No need to fetch anything for notifications
          break;
      }
    } catch (error) {
      console.error('Error fetching communication data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setAnnouncements(data || []);
  };

  const fetchEmailTemplates = async () => {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('name');

    if (error) throw error;
    setEmailTemplates(data || []);
  };

  const fetchSupportTickets = async () => {
    // First, get all support tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (ticketsError) throw ticketsError;

    // Then, get unique user IDs from tickets
    const userIds = [...new Set(ticketsData?.map(ticket => ticket.user_id).filter(Boolean) || [])];

    let usersData = [];
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        usersData = profilesData || [];
      }
    }

    // Combine tickets with user data
    const ticketsWithProfiles = ticketsData?.map(ticket => ({;
      ...ticket,
      profiles: usersData.find(user => user.id === ticket.user_id) || null
    })) || [];

    setSupportTickets(ticketsWithProfiles);
  };

  const handleSave = async (formData: any) => {
    try {
      let error;

      if (editingItem) {
        ({ error } = await supabase
          .from(getTableName())
          .update(formData)
          .eq('id', editingItem.id));
      } else {
        ({ error } = await supabase
          .from(getTableName())
          .insert(formData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'created'} successfully`,
      });

      setShowForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from(getTableName())
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const getTableName = () => {
    switch (activeTab) {
      case 'announcements': return 'announcements';
      case 'emails': return 'email_templates';
      case 'support': return 'support_tickets';
      default: return 'announcements';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Communication Tools</h2>
        {activeTab !== 'support' && activeTab !== 'notifications' && (
          <button aria-label="Button"
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button aria-label="Button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'announcements' && (
        <AnnouncementsTable 
          announcements={announcements}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {activeTab === 'emails' && (
        <EmailTemplatesTable 
          templates={emailTemplates}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {activeTab === 'support' && (
        <SupportTicketsTable tickets={supportTickets} />
      )}

      {activeTab === 'notifications' && (
        <NotificationCreator />
      )}

      {/* Only show FormModal for tabs that support it */}
      {(activeTab === 'announcements' || activeTab === 'emails') && (
        <FormModal 
          show={showForm}
          activeTab={activeTab as 'announcements' | 'emails'}
          editingItem={editingItem}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};