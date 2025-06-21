import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApiKeyFormProps extends React.HTMLAttributes<HTMLDivElement> {}
  onKeyCreated: () => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onKeyCreated }) => {}
  const [isLoading, setIsLoading] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // API call to create key would go here
      console.debug('Creating API key:', keyName);
      onKeyCreated();
      setKeyName('');
    } catch (error) {
      console.error('Error creating API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!keyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a key name",
        variant: "destructive",
      });
      return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .rpc('generate_api_key', {
          key_name: keyName
        });

      if (error) throw error;

      setNewApiKey(data[0].api_key);
      setKeyName('');

      toast({
        title: "Success",
        description: "API key created successfully",
      });

      onKeyCreated();
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New API Key</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="API Key Name"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            required
          />
          <Button variant="default" type="submit" disabled={isLoading || !keyName.trim()}>
            {isLoading ? 'Creating...' : 'Create API Key'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};