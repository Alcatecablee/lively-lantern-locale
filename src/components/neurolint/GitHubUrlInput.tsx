
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface GitHubUrlInputProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  onUpload: () => void;
  uploading: boolean;
  processing?: boolean;
}

export function GitHubUrlInput({ 
  repoUrl, 
  setRepoUrl, 
  onUpload, 
  uploading, 
  processing 
}: GitHubUrlInputProps) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="https://github.com/username/repository"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        className="bg-[#22242B] border-purple-500/30 text-white placeholder:text-muted-foreground"
        disabled={uploading || processing}
      />
      
      <Button
        onClick={onUpload}
        disabled={uploading || processing || !repoUrl.trim()}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        <Download className="w-4 h-4 mr-2" />
        {uploading ? "Uploading Repository..." : "Upload Repository"}
      </Button>
    </div>
  );
}
