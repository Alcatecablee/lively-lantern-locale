
import { SignInButton as ClerkSignInButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function SignInButton() {
  return (
    <ClerkSignInButton>
      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold">
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    </ClerkSignInButton>
  );
}
