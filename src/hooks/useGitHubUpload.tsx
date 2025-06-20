
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface RepoFile {
  name: string;
  path: string;
  download_url: string;
  type: string;
}

interface UploadStatus {
  total: number;
  processed: number;
  files: string[];
}

export function useGitHubUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);

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
    
    const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    const excludePatterns = ['node_modules', '.git', 'dist', 'build', '.next'];
    
    for (const item of contents) {
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
        const subFiles = await getAllFiles(owner, repo, item.path);
        files.push(...subFiles);
      }
    }
    
    return files;
  };

  const uploadRepository = async (
    repoUrl: string, 
    onRepoUpload: (files: { path: string; content: string }[]) => void
  ) => {
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
      const initialContents = await fetchRepoContents(repoInfo.owner, repoInfo.repo);
      const estimatedFiles = initialContents.filter(item => 
        item.type === 'file' && 
        ['.js', '.jsx', '.ts', '.tsx', '.json'].some(ext => item.name.endsWith(ext))
      ).length;
      
      setUploadStatus(prev => prev ? { ...prev, total: Math.max(estimatedFiles, 10) } : null);

      const files = await getAllFiles(repoInfo.owner, repoInfo.repo);
      
      if (files.length === 0) {
        toast({
          title: "No Files Found",
          description: "No supported files (.js, .jsx, .ts, .tsx, .json) found in the repository",
          variant: "destructive"
        });
        return;
      }

      setUploadStatus(prev => prev ? { ...prev, total: files.length } : null);

      toast({
        title: "Repository Uploaded",
        description: `Successfully uploaded ${files.length} files from ${repoInfo.owner}/${repoInfo.repo}`,
      });

      onRepoUpload(files);
      
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

  return {
    uploading,
    uploadStatus,
    uploadRepository
  };
}
