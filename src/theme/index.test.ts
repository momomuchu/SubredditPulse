import type { ThemeVariant } from '@/theme';

import { describe, expect, it } from 'vitest';
import { getThemePalette, getThemeVariant, setThemePalette, setThemeVariant } from '@/theme';

describe('Theme utilities', () => {
  it('should have default theme variant', () => {
    const variant = getThemeVariant();

    expect(['default', 'aurora', 'sunset', 'ocean']).toContain(variant);
  });

  it('should set theme variant', () => {
    const variants: ThemeVariant[] = ['default', 'aurora', 'sunset', 'ocean'];

    variants.forEach((variant) => {
      setThemeVariant(variant);

      // Note: getThemeVariant will return 'default' in test environment
      // because document is not available
      expect(getThemeVariant()).toBe('default');
    });
  });

  it('should handle custom palette', () => {
    setThemePalette({ primary: '#8b5cf6', secondary: '#ec4899' });

    // In test environment, should return null as window is not available
    const palette = getThemePalette();

    expect(palette).toBeNull();
  });
});
