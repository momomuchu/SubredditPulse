export type ThemeType = 'default' | 'aurora' | 'sunset' | 'ocean';

export const THEMES: { value: ThemeType; label: string; icon: string }[] = [
  { value: 'default', label: 'Cosmic Purple', icon: '🌌' },
  { value: 'aurora', label: 'Aurora', icon: '🌊' },
  { value: 'sunset', label: 'Sunset', icon: '�' },
  { value: 'ocean', label: 'Ocean', icon: '🌊' },
];

export const THEME_STORAGE_KEY = 'app-theme';

export function getThemeFromStorage(): ThemeType {
  if (typeof window === 'undefined') {
    return 'default';
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && ['default', 'aurora', 'sunset', 'ocean'].includes(stored)) {
    return stored as ThemeType;
  }
  return 'default';
}

export function setThemeInStorage(theme: ThemeType): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function applyTheme(theme: ThemeType): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (theme === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
