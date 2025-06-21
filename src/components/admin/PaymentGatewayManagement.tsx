import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PaymentGateway {
  id: string;
  name: string;
  display_name: string;
  is_enabled: boolean;
  credentials: Record<string, string>;
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const PaymentGatewayManagement: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('display_name');

      if (error) throw error;
      setGateways(data || []);
    } catch (error) {
      console.error('Error fetching payment gateways:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment gateways",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (gateway: PaymentGateway) => {
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .update({
          is_enabled: gateway.is_enabled,
          credentials: gateway.credentials,
          configuration: gateway.configuration,
          updated_at: new Date().toISOString()
        })
        .eq('id', gateway.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment gateway updated successfully",
      });

      setEditingGateway(null);
      fetchGateways();
    } catch (error) {
      console.error('Error updating payment gateway:', error);
      toast({
        title: "Error",
        description: "Failed to update payment gateway",
        variant: "destructive",
      });
    }
  };

  const toggleEnabled = async (gateway: PaymentGateway) => {
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .update({ 
          is_enabled: !gateway.is_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', gateway.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${gateway.display_name} ${!gateway.is_enabled ? 'enabled' : 'disabled'}`,
      });

      fetchGateways();
    } catch (error) {
      console.error('Error toggling payment gateway:', error);
      toast({
        title: "Error",
        description: "Failed to update payment gateway",
        variant: "destructive",
      });
    }
  };

  const getGatewayFields = (gatewayName: string) => {
    switch (gatewayName) {
      case 'stripe':
        return [
          { key: 'secret_key', label: 'Secret Key', type: 'password' },
          { key: 'publishable_key', label: 'Publishable Key', type: 'text' },
          { key: 'webhook_secret', label: 'Webhook Secret', type: 'password' }
        ];
      case 'paystack':
        return [
          { key: 'secret_key', label: 'Secret Key', type: 'password' },
          { key: 'public_key', label: 'Public Key', type: 'text' }
        ];
      case 'paypal':
        return [
          { key: 'client_id', label: 'Client ID', type: 'text' },
          { key: 'client_secret', label: 'Client Secret', type: 'password' },
          { key: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'live'] }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Payment Gateway Management</h2>
      </div>

      <div className="grid gap-6">
        {gateways.map((gateway) => (
          <div key={gateway.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{gateway.display_name}</h3>
                  <p className="text-gray-400 text-sm">
                    Status: {gateway.is_enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button aria-label="Button"
                  onClick={() => toggleEnabled(gateway)}
                  className={`px-3 py-1 rounded text-sm ${
                    gateway.is_enabled
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {gateway.is_enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button aria-label="Button"
                  onClick={() => setEditingGateway(gateway)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Configure</span>
                </button>
              </div>
            </div>

            {editingGateway?.id === gateway.id && (
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h4 className="text-white font-medium mb-4">Configure {gateway.display_name}</h4>
                <div className="space-y-4">
                  {getGatewayFields(gateway.name).map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {field.label}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={editingGateway.credentials[field.key] || ''}
                          onChange={(e) => setEditingGateway({
                            ...editingGateway,
                            credentials: {
                              ...editingGateway.credentials,
                              [field.key]: e.target.value
                            }
                          })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="relative">
                          <input
                            type={field.type === 'password' && !showCredentials[field.key] ? 'password' : 'text'}
                            value={editingGateway.credentials[field.key] || ''}
                            onChange={(e) => setEditingGateway({
                              ...editingGateway,
                              credentials: {
                                ...editingGateway.credentials,
                                [field.key]: e.target.value
                              }
                            })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white pr-10"
                            placeholder={`Enter ${field.label}`}
                          />
                          {field.type === 'password' && (
                            <button aria-label="Button"
                              type="button"
                              onClick={() => setShowCredentials(prev => ({
                                ...prev,
                                [field.key]: !prev[field.key]
                              }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showCredentials[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3 mt-6">
                  <button aria-label="Button"
                    onClick={() => handleSave(editingGateway)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Configuration</span>
                  </button>
                  <button aria-label="Button"
                    onClick={() => setEditingGateway(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

}