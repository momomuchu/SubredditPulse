'use client';

import type { ThemeType } from '@/utils/Theme';
import { useEffect, useState } from 'react';
import {
  applyTheme,
  getThemeFromStorage,
  setThemeInStorage,
  THEMES,

} from '@/utils/Theme';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const theme = getThemeFromStorage();
    setCurrentTheme(theme);
    applyTheme(theme);
  }, []);

  const handleThemeChange = (theme: ThemeType) => {
    setCurrentTheme(theme);
    setThemeInStorage(theme);
    applyTheme(theme);
    setIsOpen(false);
  };

  const currentThemeData = THEMES.find(t => t.value === currentTheme) ?? THEMES[0]!;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
        aria-label="Toggle theme menu"
      >
        <span className="text-base">{currentThemeData.icon}</span>
        <span className="hidden sm:inline">{currentThemeData.label}</span>
        <svg
          className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            onKeyDown={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {THEMES.map(theme => (
              <button
                key={theme.value}
                type="button"
                onClick={() => handleThemeChange(theme.value)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                  currentTheme === theme.value
                    ? 'bg-slate-100 font-semibold text-slate-900'
                    : 'text-slate-700'
                }`}
              >
                <span className="text-lg">{theme.icon}</span>
                <span>{theme.label}</span>
                {currentTheme === theme.value && (
                  <svg
                    className="ml-auto size-4 text-[var(--color-primary)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
