
import { CheckCircle } from "lucide-react";

interface UploadStatus {
  total: number;
  processed: number;
  files: string[];
}

interface GitHubUploadProgressProps {
  uploadStatus: UploadStatus;
}

export function GitHubUploadProgress({ uploadStatus }: GitHubUploadProgressProps) {
  return (
    <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
      <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
        <CheckCircle className="w-4 h-4" />
        Progress: {uploadStatus.processed}/{uploadStatus.total} files
      </div>
      <div className="text-xs text-muted-foreground">
        Latest: {uploadStatus.files[uploadStatus.files.length - 1] || "Starting..."}
      </div>
    </div>
  );
}
