
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Download, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GitHubUploadProps {
  onRepoUpload: (files: { path: string; content: string }[]) => void;
  processing?: boolean;
}

interface RepoFile {
  name: string;
  path: string;
  download_url: string;
  type: string;
}

export function GitHubUpload({ onRepoUpload, processing }: GitHubUploadProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    total: number;
    processed: number;
    files: string[];
  } | null>(null);

  const isValidGitHubUrl = (url: string) => {
    const githubRegex = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubRegex.test(url.replace(/\.git$/, ''));
  };

  const extractRepoInfo = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, '')
    };
  };

  const fetchRepoContents = async (owner: string, repo: string, path = ""): Promise<RepoFile[]> => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Repository not found or is private");
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repo contents:', error);
      throw error;
    }
  };

  const downloadFile = async (downloadUrl: string): Promise<string> => {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }
    return await response.text();
  };

  const getAllFiles = async (owner: string, repo: string, path = ""): Promise<{ path: string; content: string }[]> => {
    const contents = await fetchRepoContents(owner, repo, path);
    const files: { path: string; content: string }[] = [];
    
    // Filter for supported file types
    const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    const excludePatterns = ['node_modules', '.git', 'dist', 'build', '.next'];
    
    for (const item of contents) {
      // Skip excluded directories/files
      if (excludePatterns.some(pattern => item.path.includes(pattern))) {
        continue;
      }

      if (item.type === 'file') {
        const hasValidExtension = supportedExtensions.some(ext => item.name.endsWith(ext));
        
        if (hasValidExtension && item.download_url) {
          try {
            const content = await downloadFile(item.download_url);
            files.push({
              path: item.path,
              content
            });
            
            // Update status
            setUploadStatus(prev => prev ? {
              ...prev,
              processed: prev.processed + 1,
              files: [...prev.files, item.path]
            } : null);
          } catch (error) {
            console.warn(`Failed to download ${item.path}:`, error);
          }
        }
      } else if (item.type === 'dir') {
        // Recursively fetch directory contents
        const subFiles = await getAllFiles(owner, repo, item.path);
        files.push(...subFiles);
      }
    }
    
    return files;
  };

  const handleUpload = async () => {
    if (!repoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a GitHub repository URL",
        variant: "destructive"
      });
      return;
    }

    if (!isValidGitHubUrl(repoUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)",
        variant: "destructive"
      });
      return;
    }

    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      toast({
        title: "Error",
        description: "Could not extract repository information from URL",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ total: 0, processed: 0, files: [] });

    try {
      // First, get initial repo structure to estimate file count
      const initialContents = await fetchRepoContents(repoInfo.owner, repoInfo.repo);
      const estimatedFiles = initialContents.filter(item => 
        item.type === 'file' && 
        ['.js', '.jsx', '.ts', '.tsx', '.json'].some(ext => item.name.endsWith(ext))
      ).length;
      
      setUploadStatus(prev => prev ? { ...prev, total: Math.max(estimatedFiles, 10) } : null);

      // Get all files
      const files = await getAllFiles(repoInfo.owner, repoInfo.repo);
      
      if (files.length === 0) {
        toast({
          title: "No Files Found",
          description: "No supported files (.js, .jsx, .ts, .tsx, .json) found in the repository",
          variant: "destructive"
        });
        return;
      }

      // Update final count
      setUploadStatus(prev => prev ? { ...prev, total: files.length } : null);

      toast({
        title: "Repository Uploaded",
        description: `Successfully uploaded ${files.length} files from ${repoInfo.owner}/${repoInfo.repo}`,
      });

      onRepoUpload(files);
      setRepoUrl("");
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload repository";
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadStatus(null);
    }
  };

  return (
    <Card className="bg-[#16171c]/90 border-purple-500/30">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Github className="w-5 h-5 text-purple-400" />
          <span className="font-semibold">Upload from GitHub Repository</span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Enter a public GitHub repository URL to upload and transform all supported files (.js, .jsx, .ts, .tsx, .json)
        </div>

        <div className="space-y-3">
          <Input
            placeholder="https://github.com/username/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="bg-[#22242B] border-purple-500/30 text-white placeholder:text-muted-foreground"
            disabled={uploading || processing}
          />
          
          <Button
            onClick={handleUpload}
            disabled={uploading || processing || !repoUrl.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {uploading ? "Uploading Repository..." : "Upload Repository"}
          </Button>
        </div>

        {uploadStatus && (
          <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
              <CheckCircle className="w-4 h-4" />
              Progress: {uploadStatus.processed}/{uploadStatus.total} files
            </div>
            <div className="text-xs text-muted-foreground">
              Latest: {uploadStatus.files[uploadStatus.files.length - 1] || "Starting..."}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-300">
            <div className="font-medium mb-1">Requirements:</div>
            <ul className="space-y-1">
              <li>• Repository must be public (no authentication supported)</li>
              <li>• Only processes .js, .jsx, .ts, .tsx, and .json files</li>
              <li>• Excludes node_modules, dist, build, .git, .next directories</li>
              <li>• Large repositories may take longer to process</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
