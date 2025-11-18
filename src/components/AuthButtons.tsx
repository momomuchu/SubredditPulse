'use client';

import type { ReactNode } from 'react';
import { signIn, signOut } from 'next-auth/react';

type CommonAuthButtonProps = {
  children: ReactNode;
  className?: string;
};

type AuthSignInButtonProps = CommonAuthButtonProps & {
  provider?: string;
  callbackUrl?: string;
};

type AuthSignOutButtonProps = CommonAuthButtonProps & {
  callbackUrl?: string;
};

export const AuthSignInButton = ({
  provider = 'github',
  callbackUrl,
  children,
  className,
}: AuthSignInButtonProps) => {
  return (
    <button
      className={className}
      type="button"
      onClick={() => signIn(provider, callbackUrl ? { redirectTo: callbackUrl } : undefined)}
    >
      {children}
    </button>
  );
};

export const AuthSignOutButton = ({
  callbackUrl,
  children,
  className,
}: AuthSignOutButtonProps) => {
  return (
    <button
      className={className}
      type="button"
      onClick={() => signOut(callbackUrl ? { redirectTo: callbackUrl } : undefined)}
    >
      {children}
    </button>
  );
};
