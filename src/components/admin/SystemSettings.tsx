import { useState, useEffect } from 'react';
import { Mail, Shield, Database, Bell, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SystemSetting {
  id: string;
  key: string;
  value: string | number | boolean | string[];
  category: string;
  created_at: string;
  updated_at: string;
}

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}

interface SecuritySettings {
  session_timeout: number;
  max_login_attempts: number;
  password_min_length: number;
  require_email_verification: boolean;
}

interface ApiSettings {
  default_rate_limit: number;
  max_file_size_mb: number;
  allowed_file_types: string[];
  enable_analytics: boolean;
}

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: 'React Doctor'
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    session_timeout: 24,
    max_login_attempts: 5,
    password_min_length: 8,
    require_email_verification: true
  });

  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    default_rate_limit: 60,
    max_file_size_mb: 10,
    allowed_file_types: ['js', 'jsx', 'ts', 'tsx'],
    enable_analytics: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      setSettings(data || []);

      // Parse settings into categories
      data?.forEach(setting => {
        const value = setting.value;

        switch (setting.category) {
          case 'email':
            setEmailSettings(prev => ({ ...prev, [setting.key]: value }));
            break;
          case 'security':
            setSecuritySettings(prev => ({ ...prev, [setting.key]: value }));
            break;
          case 'api':
            setApiSettings(prev => ({ ...prev, [setting.key]: value }));
            break;
        }
      });

    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (category: string, settingsData: any) => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settingsData)) {
        await supabase
          .from('system_settings')
          .upsert({
            key,
            value: value // @ts-ignore
,
            category
          });
      }

      toast({
        title: "Success",
        description: `${category} settings saved successfully`,
      });

      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">System Settings</h2>
        <p className="text-gray-400">Configure system-wide settings and preferences</p>
      </div>

      {/* Email Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Email Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
            <input
              type="text"
              value={emailSettings.smtp_host}
              onChange={(e) => setEmailSettings({...emailSettings, smtp_host: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              placeholder="smtp.gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
            <input
              type="number"
              value={emailSettings.smtp_port}
              onChange={(e) => setEmailSettings({...emailSettings, smtp_port: parseInt(e.target.value)})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">From Email</label>
            <input
              type="email"
              value={emailSettings.from_email}
              onChange={(e) => setEmailSettings({...emailSettings, from_email: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              placeholder="noreply@yourdomain.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">From Name</label>
            <input
              type="text"
              value={emailSettings.from_name}
              onChange={(e) => setEmailSettings({...emailSettings, from_name: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        <button aria-label="Button"
          onClick={() => saveSettings('email', emailSettings)}
          disabled={saving}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Email Settings'}</span>
        </button>
      </div>

      {/* Security Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-6 w-6 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Security Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (hours)</label>
            <input
              type="number"
              value={securitySettings.session_timeout}
              onChange={(e) => setSecuritySettings({...securitySettings, session_timeout: parseInt(e.target.value)})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Login Attempts</label>
            <input
              type="number"
              value={securitySettings.max_login_attempts}
              onChange={(e) => setSecuritySettings({...securitySettings, max_login_attempts: parseInt(e.target.value)})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password Min Length</label>
            <input
              type="number"
              value={securitySettings.password_min_length}
              onChange={(e) => setSecuritySettings({...securitySettings, password_min_length: parseInt(e.target.value)})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="email_verification"
              checked={securitySettings.require_email_verification}
              onChange={(e) => setSecuritySettings({...securitySettings, require_email_verification: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded"
            />
            <label htmlFor="email_verification" className="text-sm font-medium text-gray-300">
              Require Email Verification
            </label>
          </div>
        </div>

        <button aria-label="Button"
          onClick={() => saveSettings('security', securitySettings)}
          disabled={saving}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Security Settings'}</span>
        </button>
      </div>

      {/* API Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="h-6 w-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">API Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Default Rate Limit (per minute)</label>
            <input
              type="number"
              value={apiSettings.default_rate_limit}
              onChange={(e) => setApiSettings({...apiSettings, default_rate_limit: parseInt(e.target.value)})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max File Size (MB)</label>
            <input
              type="number"
              value={apiSettings.max_file_size_mb}
              onChange={(e) => setApiSettings({...apiSettings, max_file_size_mb: parseInt(e.target.value)})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enable_analytics"
              checked={apiSettings.enable_analytics}
              onChange={(e) => setApiSettings({...apiSettings, enable_analytics: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded"
            />
            <label htmlFor="enable_analytics" className="text-sm font-medium text-gray-300">
              Enable Usage Analytics
            </label>
          </div>
        </div>

        <button aria-label="Button"
          onClick={() => saveSettings('api', apiSettings)}
          disabled={saving}
          className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save API Settings'}</span>
        </button>
      </div>
    </div>
  );
};

}