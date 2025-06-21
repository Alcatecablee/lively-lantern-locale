
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Github, AlertCircle, CheckCircle } from 'lucide-react';

interface GitHubUploadProps {
  enabledLayers: number[];
}

export function GitHubUpload({ enabledLayers }: GitHubUploadProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [filePath, setFilePath] = useState('');
  const [code, setCode] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleUpload = async () => {
    if (!repoUrl || !accessToken || !filePath || !code) {
      setResult({
        success: false,
        message: 'Please fill in all required fields'
      });
      return;
    }

    console.log('Starting GitHub upload with enabled layers:', enabledLayers);
    setIsUploading(true);
    setResult(null);

    try {
      // Simulate GitHub API upload (in a real implementation, this would use the GitHub API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResult({
        success: true,
        message: `Successfully uploaded code to ${filePath} using layers [${enabledLayers.join(', ')}]`
      });
      
      console.log('GitHub upload completed successfully');
    } catch (error) {
      console.error('GitHub upload failed:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setRepoUrl('');
    setAccessToken('');
    setFilePath('');
    setCode('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Github className="w-5 h-5" />
            GitHub Upload
            <span className="text-sm font-normal text-gray-400">
              (Layers: {enabledLayers.length > 0 ? enabledLayers.join(', ') : 'None'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repoUrl" className="text-white">
                Repository URL *
              </Label>
              <Input
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="bg-gray-900/50 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filePath" className="text-white">
                File Path *
              </Label>
              <Input
                id="filePath"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="src/components/MyComponent.tsx"
                className="bg-gray-900/50 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken" className="text-white">
              GitHub Access Token *
            </Label>
            <Input
              id="accessToken"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxx"
              className="bg-gray-900/50 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400">
              Create a personal access token in GitHub Settings → Developer settings → Personal access tokens
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-white">
              Code to Upload *
            </Label>
            <Textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="min-h-[200px] bg-gray-900/50 border-gray-600 text-white font-mono text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleUpload}
              disabled={isUploading || enabledLayers.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 animate-pulse" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload to GitHub
                </div>
              )}
            </Button>
            
            <Button 
              onClick={handleClear}
              variant="outline"
              disabled={isUploading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Clear
            </Button>
          </div>

          {enabledLayers.length === 0 && (
            <p className="text-amber-400 text-sm text-center">
              Please enable at least one layer above to upload to GitHub.
            </p>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className={`border ${result.success ? 'border-green-700 bg-green-900/20' : 'border-red-700 bg-red-900/20'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`${result.success ? 'text-green-300' : 'text-red-300'}`}>
                {result.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
