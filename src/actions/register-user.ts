'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/libs/DB';
import { hashPassword } from '@/libs/password';
import { users } from '@/models/Schema';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(120).optional(),
});

export type RegisterUserInput = z.input<typeof registerSchema>;

export type RegisterUserResult
  = | { success: true }
    | { success: false; code: 'INVALID_INPUT' | 'ACCOUNT_EXISTS' | 'UNKNOWN' };

export const registerUser = async (input: RegisterUserInput): Promise<RegisterUserResult> => {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      code: 'INVALID_INPUT',
    };
  }

  const { email, password, name } = parsed.data;

  const existingUser = await db.query.users.findFirst({
    where: (usersTable, { eq: eqFn }) => eqFn(usersTable.email, email),
  });

  const passwordHash = await hashPassword(password);

  try {
    if (existingUser) {
      if (existingUser.passwordHash) {
        return {
          success: false,
          code: 'ACCOUNT_EXISTS',
        };
      }

      await db
        .update(users)
        .set({
          passwordHash,
          name: name ?? existingUser.name,
        })
        .where(eq(users.id, existingUser.id));

      return { success: true };
    }

    await db.insert(users).values({
      email,
      passwordHash,
      name,
    });

    return { success: true };
  } catch (error) {
    console.error('registerUser error', error);

    return {
      success: false,
      code: 'UNKNOWN',
    };
  }
};
