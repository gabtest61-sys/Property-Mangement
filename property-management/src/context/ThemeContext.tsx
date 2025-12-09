'use client';

import { createContext, useContext, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage key
const THEME_KEY = 'theme';

// Theme store for useSyncExternalStore
let themeListeners: Array<() => void> = [];
let currentTheme: Theme = 'system';

function getThemeSnapshot(): Theme {
  return currentTheme;
}

function getServerThemeSnapshot(): Theme {
  return 'system';
}

function subscribeToTheme(callback: () => void) {
  themeListeners.push(callback);
  return () => {
    themeListeners = themeListeners.filter(l => l !== callback);
  };
}

function setThemeValue(newTheme: Theme) {
  currentTheme = newTheme;
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_KEY, newTheme);
  }
  themeListeners.forEach(listener => listener());
}

// Initialize theme from localStorage on client
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    currentTheme = stored as Theme;
  }
}

// System theme store
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribeToSystemTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

// Mounted store (avoids useState + useEffect)
let isMounted = false;
let mountListeners: Array<() => void> = [];

function getMountedSnapshot(): boolean {
  return isMounted;
}

function getServerMountedSnapshot(): boolean {
  return false;
}

function subscribeToMounted(callback: () => void) {
  mountListeners.push(callback);
  // Trigger mount on first subscription (client-side only)
  if (typeof window !== 'undefined' && !isMounted) {
    isMounted = true;
    // Use queueMicrotask to batch the update
    queueMicrotask(() => {
      mountListeners.forEach(l => l());
    });
  }
  return () => {
    mountListeners = mountListeners.filter(l => l !== callback);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Subscribe to theme changes
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  // Subscribe to system theme changes
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    () => 'light' as const
  );

  // Subscribe to mounted state
  const mounted = useSyncExternalStore(
    subscribeToMounted,
    getMountedSnapshot,
    getServerMountedSnapshot
  );

  // Compute resolved theme
  const resolvedTheme = useMemo((): 'light' | 'dark' => {
    if (theme === 'system') {
      return systemTheme;
    }
    return theme;
  }, [theme, systemTheme]);

  // Apply theme to DOM (external system sync - this is what effects are for)
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeValue(newTheme);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  );

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'system', setTheme: () => {}, resolvedTheme: 'light' }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
