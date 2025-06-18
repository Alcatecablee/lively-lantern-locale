
import { UserButton as ClerkUserButton } from '@clerk/clerk-react';

export function UserButton() {
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
