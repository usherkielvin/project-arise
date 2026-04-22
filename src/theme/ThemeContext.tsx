/**
 * ThemeContext — Provides active color palette + mode toggle.
 * Mode options: 'auto' (follow system), 'light', 'dark'.
 */
import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setMode] = useState<ThemeMode>('auto');

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
