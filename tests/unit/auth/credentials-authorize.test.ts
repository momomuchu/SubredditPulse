import { describe, expect, it, vi } from 'vitest';
import { authorizeWithEmailPassword } from '@/auth.config';

describe('authorizeWithEmailPassword', () => {
  it('returns null when credentials are invalid', async () => {
    const result = await authorizeWithEmailPassword({ email: 'not-an-email', password: 'short' });

    expect(result).toBeNull();
  });

  it('returns null when the user does not exist', async () => {
    const deps = {
      findUserByEmail: vi.fn().mockResolvedValue(undefined),
      verifyPassword: vi.fn(),
    };

    const result = await authorizeWithEmailPassword({ email: 'user@example.com', password: 'password123' }, deps);

    expect(result).toBeNull();
    expect(deps.findUserByEmail).toHaveBeenCalledWith('user@example.com');
    expect(deps.verifyPassword).not.toHaveBeenCalled();
  });

  it('returns null when the user has no password hash', async () => {
    const deps = {
      findUserByEmail: vi.fn().mockResolvedValue({ id: '1', email: 'user@example.com', passwordHash: null }),
      verifyPassword: vi.fn(),
    };

    const result = await authorizeWithEmailPassword({ email: 'user@example.com', password: 'password123' }, deps);

    expect(result).toBeNull();
    expect(deps.verifyPassword).not.toHaveBeenCalled();
  });

  it('returns null when password verification fails', async () => {
    const deps = {
      findUserByEmail: vi.fn().mockResolvedValue({ id: '1', email: 'user@example.com', passwordHash: 'hash', name: 'Test User' }),
      verifyPassword: vi.fn().mockResolvedValue(false),
    };

    const result = await authorizeWithEmailPassword({ email: 'user@example.com', password: 'password123' }, deps);

    expect(result).toBeNull();
    expect(deps.verifyPassword).toHaveBeenCalledWith('password123', 'hash');
  });

  it('returns the user profile when authentication succeeds', async () => {
    const user = { id: '1', email: 'user@example.com', passwordHash: 'hash', name: 'Tester' };
    const deps = {
      findUserByEmail: vi.fn().mockResolvedValue(user),
      verifyPassword: vi.fn().mockResolvedValue(true),
    };

    const result = await authorizeWithEmailPassword({ email: 'user@example.com', password: 'password123' }, deps);

    expect(result).toEqual({ id: user.id, email: user.email, name: user.name });
    expect(deps.verifyPassword).toHaveBeenCalledWith('password123', 'hash');
  });
});
