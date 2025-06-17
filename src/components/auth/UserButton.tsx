
import { UserButton as ClerkUserButton } from '@clerk/nextjs';

export function UserButton() {
  return (
    <ClerkUserButton
      appearance={{
        baseTheme: 'dark',
        elements: {
          avatarBox: 'w-8 h-8',
        },
      }}
    />
  );
}
