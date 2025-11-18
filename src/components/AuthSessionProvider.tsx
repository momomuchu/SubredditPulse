'use client';

import type { Session } from 'next-auth';
import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

type AuthSessionProviderProps = {
  children: ReactNode;
  session: Session | null;
};

export const AuthSessionProvider = ({ children, session }: AuthSessionProviderProps) => {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
};
