
import { ClerkProvider as ClerkAuthProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface ClerkProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <ClerkAuthProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: 'dark',
        variables: {
          colorPrimary: '#7c3aed',
        },
      }}
    >
      {children}
    </ClerkAuthProvider>
  );
}
