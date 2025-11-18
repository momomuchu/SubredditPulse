'use client';

export type ThemePalette = {
  primary: string;
  secondary: string;
};

export type ThemeVariant = 'default' | 'aurora' | 'sunset' | 'ocean';

const isBrowser = () => typeof window !== 'undefined';

export const setThemePalette = ({ primary, secondary }: ThemePalette) => {
  if (!isBrowser()) {
    return;
  }

  const root = document.documentElement;

  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--color-brand-primary', primary);
  root.style.setProperty('--color-brand-accent', secondary);
};

export const setThemeVariant = (variant: ThemeVariant) => {
  if (!isBrowser()) {
    return;
  }

  const root = document.documentElement;

  if (variant === 'default') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', variant);
  }
};

export const getThemePalette = (): ThemePalette | null => {
  if (!isBrowser()) {
    return null;
  }

  const root = document.documentElement;

  return {
    primary: getComputedStyle(root).getPropertyValue('--color-primary').trim(),
    secondary: getComputedStyle(root).getPropertyValue('--color-secondary').trim(),
  };
};

export const getThemeVariant = (): ThemeVariant => {
  if (!isBrowser()) {
    return 'default';
  }

  const root = document.documentElement;
  const theme = root.getAttribute('data-theme');

  // Validate theme value before returning
  const validThemes: ThemeVariant[] = ['default', 'aurora', 'sunset', 'ocean'];
  if (theme && validThemes.includes(theme as ThemeVariant)) {
    return theme as ThemeVariant;
  }

  return 'default';
};
