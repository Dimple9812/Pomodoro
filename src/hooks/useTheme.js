import { useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants.js';
import { useLocalStorage } from './useLocalStorage.js';

function getSystemTheme() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

const sanitizeTheme = (value) => (value === 'dark' || value === 'light' ? value : getSystemTheme());

export function useTheme() {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.theme, getSystemTheme, sanitizeTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0912' : '#f7f5ff');
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [setTheme]);

  return { theme, setTheme, toggleTheme };
}
