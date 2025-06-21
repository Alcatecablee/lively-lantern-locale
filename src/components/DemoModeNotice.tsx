import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';

export const DemoModeNotice = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || isSupabaseConfigured()) {
    return null;
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-600/30 text-yellow-200 px-4 py-3 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">
            <strong>Demo Mode:</strong> Running with mock data. Configure Supabase environment variables for full functionality.
          </span>
        </div>
        <button aria-label="Button"
          onClick={() => setIsVisible(false)}
          className="text-yellow-200 hover:text-yellow-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}; 