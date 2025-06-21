import { useState, useEffect } from 'react';
import { Edit, Trash2, Save, X, Eye, EyeOff, Calendar, Users, Flag, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AnnouncementForm } from './communication/AnnouncementForm';
import { FeatureFlagForm } from './features/FeatureFlagForm';
import { PricingPlanForm } from './pricing/PricingPlanForm';

type ContentTab = 'announcements' | 'features' | 'pricing';

interface Announcement {
  id: string;
  title: string;
  content: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  created_at: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export const ContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentTab>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [pricing, setPricing] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | FeatureFlag | PricingPlan | null>(null);
  const { toast } = useToast();

  const tabs = [
    { id: 'announcements' as ContentTab, name: 'Announcements', icon: Users },
    { id: 'features' as ContentTab, name: 'Feature Flags', icon: Flag },
    { id: 'pricing' as ContentTab, name: 'Pricing Plans', icon: DollarSign },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let data, error;

      switch (activeTab) {
        case 'announcements':
          ({ data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false }));
          setAnnouncements(data || []);
          break;
        case 'features':
          ({ data, error } = await supabase
            .from('feature_flags')
            .select('*')
            .order('name'));
          setFeatures(data || []);
          break;
        case 'pricing':
          ({ data, error } = await supabase
            .from('pricing_plans')
            .select('*')
            .order('sort_order'));
          setPricing(data || []);
          break;
      }

      if (error) throw error;
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      let error;

      if (editingItem) {
        // Update existing item
        ({ error } = await supabase
          .from(getTableName())
          .update(formData)
          .eq('id', editingItem.id));
      } else {
        // Create new item
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

  const toggleFeatureFlag = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: !currentState })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling feature:', error);
    }
  };

  const getTableName = () => {
    switch (activeTab) {
      case 'announcements': return 'announcements';
      case 'features': return 'feature_flags';
      case 'pricing': return 'pricing_plans';
      default: return 'announcements';
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'announcements': return announcements;
      case 'features': return features;
      case 'pricing': return pricing;
      default: return [];
    }
  };

  const renderForm = () => {
    if (!showForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}
            </h3>
            <button aria-label="Button"
              onClick={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {activeTab === 'announcements' && (
            <AnnouncementForm 
              item={editingItem} 
              onSave={handleSave} 
              onCancel={() => setShowForm(false)} 
            />
          )}
          {activeTab === 'features' && (
            <FeatureFlagForm 
              item={editingItem} 
              onSave={handleSave} 
              onCancel={() => setShowForm(false)} 
            />
          )}
          {activeTab === 'pricing' && (
            <PricingPlanForm 
              item={editingItem} 
              onSave={handleSave} 
              onCancel={() => setShowForm(false)} 
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Content Management</h2>
        <button aria-label="Button"
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New</span>
        </button>
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
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  {activeTab === 'announcements' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Audience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                  {activeTab === 'features' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rollout</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                  {activeTab === 'pricing' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monthly</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Yearly</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {getCurrentData().map((item: any) => (
                  <tr key={item.id}>
                    {activeTab === 'announcements' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-white">{item.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.type === 'error' ? 'bg-red-100 text-red-800' :
                            item.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            item.type === 'success' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{item.target_audience}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </>
                    )}
                    {activeTab === 'features' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-white">{item.name}</td>
                        <td className="px-6 py-4 text-gray-300">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button aria-label="Button"
                            onClick={() => toggleFeatureFlag(item.id, item.is_enabled)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                              item.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.is_enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            <span>{item.is_enabled ? 'Enabled' : 'Disabled'}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{item.rollout_percentage}%</td>
                      </>
                    )}
                    {activeTab === 'pricing' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-white">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">${item.price_monthly}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">${item.price_yearly}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button aria-label="Button"
                          onClick={() => {
                            setEditingItem(item);
                            setShowForm(true);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button aria-label="Button"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {renderForm()}
    </div>
  );
};

const AnnouncementForm: React.FC<{ item: any; onSave: (data: any) => void; onCancel: () => void }> = ({}
  item, onSave, onCancel
}) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    content: item?.content || '',
    type: item?.type || 'info',
    target_audience: item?.target_audience || 'all',
    is_active: item?.is_active ?? true,
    starts_at: item?.starts_at || '',
    expires_at: item?.expires_at || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-24"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
          <select
            value={formData.target_audience}
            onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">All Users</option>
            <option value="admins">Admins Only</option>
            <option value="users">Regular Users</option>
          </select>
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="rounded border-gray-700 bg-gray-800 text-blue-600"
        />
        <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">Active</label>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white"
         aria-label="Button">
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
         aria-label="Button">
        </button>
      </div>
    </form>
  );
};

const FeatureFlagForm: React.FC<{ item: any; onSave: (data: any) => void; onCancel: () => void }> = ({}
  item, onSave, onCancel
}) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    is_enabled: item?.is_enabled ?? false,
    rollout_percentage: item?.rollout_percentage || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono"
          placeholder="feature_name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-20"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Rollout Percentage</label>
        <input
          type="range"
          min="0"
          max="100"
          value={formData.rollout_percentage}
          onChange={(e) => setFormData({ ...formData, rollout_percentage: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="text-center text-gray-300 text-sm mt-1">{formData.rollout_percentage}%</div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_enabled"
          checked={formData.is_enabled}
          onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
          className="rounded border-gray-700 bg-gray-800 text-blue-600"
        />
        <label htmlFor="is_enabled" className="ml-2 text-sm text-gray-300">Enabled</label>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white"
         aria-label="Button">
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
         aria-label="Button">
        </button>
      </div>
    </form>
  );
};

const PricingPlanForm: React.FC<{ item: any; onSave: (data: any) => void; onCancel: () => void }> = ({}
  item, onSave, onCancel
}) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price_monthly: item?.price_monthly || 0,
    price_yearly: item?.price_yearly || 0,
    features: item?.features ? item.features.join('\n') : '',
    is_active: item?.is_active ?? true,
    sort_order: item?.sort_order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const featuresArray = formData.features.split('\n').filter(f => f.trim());
    onSave({ ...formData, features: featuresArray });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Plan Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-20"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.price_monthly}
            onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Yearly Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.price_yearly}
            onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Features (one per line)</label>
        <textarea
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-24"
          placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <div className="flex items-center pt-6">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked )}
            className="rounded border-gray-700 bg-gray-800 text-blue-600"
          />
          <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">Active</label>
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel
          className="px-4 py-2 text-gray-300 hover:text-white"
         aria-label="Button">
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
         aria-label="Button">
        </button>
      </div>
    </form>
  );

                          </Trash2>