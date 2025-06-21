import React from 'react';
import { Key, Eye, EyeOff, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at?: string;
  usage_count: number;
  rate_limit_per_minute: number;
  is_active: boolean;
}

interface ApiKeysListProps extends React.HTMLAttributes<HTMLDivElement> {}
  apiKeys: ApiKey[];
  onKeysChange: () => void;
}

export const ApiKeysList: React.FC<ApiKeysListProps> = ({ apiKeys, onKeysChange }) => {}
  const { user } = useAuth();
  const { toast } = useToast();

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "API key deleted successfully",
      });

      onKeysChange();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const toggleApiKey = async (keyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .update({ is_active: !isActive })
        .eq('id', keyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `API key ${!isActive ? 'activated' : 'deactivated'}`,
      });

      onKeysChange();
    } catch (error) {
      console.error('Error toggling API key:', error);
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const revokeKey = (keyId: string) => {
    console.debug('Revoking key:', keyId);
    onKeysChange();
  };

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-8">
        <Key className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">No API keys created yet</p>
        <p className="text-gray-500 text-sm">Create your first API key to access the React Doctor API</p>
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{key.name}</p>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(key.created_at).toLocaleDateString()}
                </p>
                <Badge variant={key.is_active ? 'default' : 'secondary'}>
                  {key.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(key.key_prefix)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteApiKey(key.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

                  </Trash2>