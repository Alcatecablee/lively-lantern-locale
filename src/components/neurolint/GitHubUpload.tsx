
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Github } from "lucide-react";
import { GitHubUrlInput } from "./GitHubUrlInput";
import { GitHubUploadProgress } from "./GitHubUploadProgress";
import { GitHubUploadInfo } from "./GitHubUploadInfo";
import { useGitHubUpload } from "@/hooks/useGitHubUpload";

interface GitHubUploadProps {
  onRepoUpload: (files: { path: string; content: string }[]) => void;
  processing?: boolean;
}

export function GitHubUpload({ onRepoUpload, processing }: GitHubUploadProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const { uploading, uploadStatus, uploadRepository } = useGitHubUpload();

  const handleUpload = async () => {
    await uploadRepository(repoUrl, onRepoUpload);
    setRepoUrl("");
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

        <GitHubUrlInput
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          onUpload={handleUpload}
          uploading={uploading}
          processing={processing}
        />

        {uploadStatus && (
          <GitHubUploadProgress uploadStatus={uploadStatus} />
        )}

        <GitHubUploadInfo />
      </CardContent>
    </Card>
  );
}
