/**
 * ThemeContext — Provides active color palette + mode toggle.
 * Mode options: 'auto' (follow system), 'light', 'dark'.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT, DARK, Colors } from './colors';

export type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeContextValue {
  colors: Colors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: LIGHT,
  isDark: false,
  mode: 'auto',
  setMode: () => {},
});

const THEME_MODE_STORAGE_KEY = 'project-arise-theme-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setMode] = useState<ThemeMode>('auto');

  useEffect(() => {
    const loadMode = async () => {
      const stored = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (stored === 'auto' || stored === 'light' || stored === 'dark') {
        setMode(stored);
      }
    };

    loadMode().catch(() => {
      // Ignore storage read failures and keep fallback mode.
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode).catch(() => {
      // Ignore storage write failures; this should not block rendering.
    });
  }, [mode]);

  const isDark = useMemo(() => {
    if (mode === 'auto') return systemScheme === 'dark';
    return mode === 'dark';
  }, [mode, systemScheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    colors: isDark ? DARK : LIGHT,
    isDark,
    mode,
    setMode,
  }), [isDark, mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
