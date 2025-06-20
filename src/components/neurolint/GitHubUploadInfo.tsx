
import { AlertCircle } from "lucide-react";

export function GitHubUploadInfo() {
  return (
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
  );
}
