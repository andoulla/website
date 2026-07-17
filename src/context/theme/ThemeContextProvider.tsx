import { ThemeProvider } from '@mui/material/styles';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

import { createGreenTheme, createPurpleTheme } from '@/themes';
import type { Density } from '@/themes';

import {
  prefersDarkColourScheme,
  readStoredDarkMode,
  readStoredDensity,
  readStoredThemeName,
  storeDarkMode,
  storeDensity,
  storeThemeName,
} from './ThemeContextProvider.helpers';
import type {
  ThemeContextProviderProps,
  ThemeContextValue,
  ThemeName,
} from './ThemeContextProvider.types';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useThemeContext = (): ThemeContextValue => {
  const ctx = use(ThemeContext);
  if (ctx === null) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return ctx;
};

export const ThemeContextProvider = ({
  children,
  initialTheme,
  initialDarkMode,
  initialDensity,
}: ThemeContextProviderProps) => {
  // Explicit props win, then the stored preference, then the default (system scheme for dark).
  const [themeName, setThemeName] = useState<ThemeName>(
    () => initialTheme ?? readStoredThemeName() ?? 'purple'
  );
  const [isDarkMode, setIsDarkMode] = useState(
    () => initialDarkMode ?? readStoredDarkMode() ?? prefersDarkColourScheme()
  );
  const [density, setDensity] = useState<Density>(
    () => initialDensity ?? readStoredDensity() ?? 'compact'
  );

  useEffect(() => {
    storeThemeName(themeName);
  }, [themeName]);
  useEffect(() => {
    storeDarkMode(isDarkMode);
  }, [isDarkMode]);
  useEffect(() => {
    storeDensity(density);
  }, [density]);

  const toggleTheme = useCallback(
    () => setThemeName((n) => (n === 'green' ? 'purple' : 'green')),
    []
  );
  const toggleDarkMode = useCallback(() => setIsDarkMode((d) => !d), []);
  const toggleDensity = useCallback(
    () => setDensity((current) => (current === 'compact' ? 'comfortable' : 'compact')),
    []
  );

  const muiTheme = useMemo(() => {
    const mode = isDarkMode ? 'dark' : 'light';
    return themeName === 'green'
      ? createGreenTheme(mode, density)
      : createPurpleTheme(mode, density);
  }, [themeName, isDarkMode, density]);

  const contextValue = useMemo(
    () => ({ themeName, toggleTheme, isDarkMode, toggleDarkMode, density, toggleDensity }),
    [themeName, toggleTheme, isDarkMode, toggleDarkMode, density, toggleDensity]
  );

  return (
    <ThemeContext value={contextValue}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ThemeContext>
  );
};
