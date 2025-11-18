import { describe, expect, it } from 'vitest';
import { resolveRedirectUrl } from '@/auth.config';

const baseUrl = 'https://example.com';

describe('resolveRedirectUrl', () => {
  it('returns dashboard when url is undefined', () => {
    expect(resolveRedirectUrl(undefined, baseUrl)).toBe('https://example.com/dashboard/');
  });

  it('returns provided absolute url within same origin', () => {
    const url = 'https://example.com/dashboard/settings';

    expect(resolveRedirectUrl(url, baseUrl)).toBe(url);
  });

  it('normalizes relative urls against base', () => {
    const url = '/profile';

    expect(resolveRedirectUrl(url, baseUrl)).toBe('https://example.com/profile');
  });

  it('falls back to dashboard for external origins', () => {
    const url = 'https://malicious.example/dashboard';

    expect(resolveRedirectUrl(url, baseUrl)).toBe('https://example.com/dashboard/');
  });
});
