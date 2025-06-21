
import { SignInButton as ClerkSignInButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function SignInButton() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // If no Clerk key is available, render a disabled button
  if (!publishableKey) {
    return (
      <Button 
        disabled 
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold opacity-50"
        title="Authentication is disabled. Set VITE_CLERK_PUBLISHABLE_KEY to enable."
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign In (Disabled)
      </Button>
    );
  }

  return (
    <ClerkSignInButton>
      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold">
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    </ClerkSignInButton>
  );
}
