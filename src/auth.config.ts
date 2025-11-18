import type { InferSelectModel } from 'drizzle-orm';
import type { NextAuthConfig } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { verifyPassword as defaultVerifyPassword } from '@/libs/password';
import * as schema from '@/models/Schema';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type UserRecord = InferSelectModel<typeof schema.users>;

type CredentialsAuthDeps = {
  findUserByEmail: (email: string) => Promise<UserRecord | undefined | null>;
  verifyPassword: typeof defaultVerifyPassword;
};

const defaultDeps: CredentialsAuthDeps = {
  findUserByEmail: async (email: string) => {
    return db.query.users.findFirst({
      where: (usersTable, { eq }) => eq(usersTable.email, email),
    });
  },
  verifyPassword: defaultVerifyPassword,
};

const DASHBOARD_PATH = '/dashboard/';

export const resolveRedirectUrl = (url: string | undefined, baseUrl: string) => {
  const dashboardUrl = new URL(DASHBOARD_PATH, baseUrl).toString();

  if (!url) {
    return dashboardUrl;
  }

  try {
    const parsed = new URL(url);
    const baseOrigin = new URL(baseUrl).origin;

    if (parsed.origin === baseOrigin) {
      return parsed.toString();
    }

    return dashboardUrl;
  } catch {
    return new URL(url, baseUrl).toString();
  }
};

export const authorizeWithEmailPassword = async (
  credentials: unknown,
  deps: CredentialsAuthDeps = defaultDeps,
) => {
  const parsed = credentialsSchema.safeParse(credentials);

  if (!parsed.success) {
    return null;
  }

  const existingUser = await deps.findUserByEmail(parsed.data.email);

  if (!existingUser?.passwordHash) {
    return null;
  }

  const isValid = await deps.verifyPassword(parsed.data.password, existingUser.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
  };
};

export const authConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
    authenticatorsTable: schema.authenticators,
  }),
  secret: Env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    GitHub({
      clientId: Env.GITHUB_CLIENT_ID,
      clientSecret: Env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: Env.GOOGLE_CLIENT_ID,
      clientSecret: Env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Email and password',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      authorize: credentials => authorizeWithEmailPassword(credentials),
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      // Add user id to token on sign in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    redirect: async ({ url, baseUrl }) => {
      return resolveRedirectUrl(url, baseUrl);
    },
    session: async ({ session, token }) => {
      // Add user id from token to session
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
