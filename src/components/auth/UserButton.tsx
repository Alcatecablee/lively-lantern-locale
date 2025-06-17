
import { UserButton as ClerkUserButton } from '@clerk/nextjs';

export function UserButton() {
  return (
    <ClerkUserButton
      appearance={{
        baseTheme: undefined, // Remove the 'dark' string that's causing the error
        elements: {
          avatarBox: 'w-8 h-8',
        },
      }}
    />
  );
}
