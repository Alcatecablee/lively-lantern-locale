
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";

export function BetaBanner() {
  return (
    <Alert className="bg-yellow-50 border-yellow-400 text-yellow-900 mb-4 flex items-center gap-2 px-4 py-3 rounded-lg max-w-xl mx-auto shadow z-50">
      <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
      <div>
        <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
          Beta
          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold ml-1">BETA</span>
        </AlertTitle>
        <AlertDescription className="text-xs mt-0.5">
          This tool is currently in beta. Things may change or break—please send feedback!
        </AlertDescription>
      </div>
    </Alert>
  );
}
