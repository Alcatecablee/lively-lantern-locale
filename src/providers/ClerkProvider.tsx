
import { ClerkProvider as ClerkAuthProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

interface ClerkProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  // If no Clerk key is provided, render children without Clerk provider
  if (!publishableKey) {
    console.warn('VITE_CLERK_PUBLISHABLE_KEY is not set. Authentication features will be disabled.');
    return <>{children}</>;
  }

  return (
    <ClerkAuthProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#7c3aed',
        },
      }}
    >
      {children}
    </ClerkAuthProvider>
  );
}
