'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2xlcmstcGxhY2Vob2xkZXItdGVzdC1rZXkk';

  return (
    <ClerkProvider publishableKey={clerkKey}>
      {children}
    </ClerkProvider>
  );
}
