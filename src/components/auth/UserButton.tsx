
import { UserButton as ClerkUserButton } from '@clerk/clerk-react';

export function UserButton() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // If no Clerk key is available, render a placeholder
  if (!publishableKey) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-gray-300">
        U
      </div>
    );
  }

  return (
    <ClerkUserButton
      appearance={{
        baseTheme: undefined,
        elements: {
          avatarBox: 'w-8 h-8',
        },
      }}
    />
  );
}
