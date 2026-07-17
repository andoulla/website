import { ThemeProvider } from '@mui/material/styles';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

import { createGreenTheme, createPurpleTheme } from '@/themes';

import {
  prefersDarkColourScheme,
  readStoredDarkMode,
  readStoredThemeName,
  storeDarkMode,
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
}: ThemeContextProviderProps) => {
  // Explicit props win, then the stored preference, then the default (system scheme for dark).
  const [themeName, setThemeName] = useState<ThemeName>(
    () => initialTheme ?? readStoredThemeName() ?? 'purple'
  );
  const [isDarkMode, setIsDarkMode] = useState(
    () => initialDarkMode ?? readStoredDarkMode() ?? prefersDarkColourScheme()
  );

  useEffect(() => {
    storeThemeName(themeName);
  }, [themeName]);
  useEffect(() => {
    storeDarkMode(isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = useCallback(
    () => setThemeName((n) => (n === 'green' ? 'purple' : 'green')),
    []
  );
  const toggleDarkMode = useCallback(() => setIsDarkMode((d) => !d), []);

  const muiTheme = useMemo(() => {
    const mode = isDarkMode ? 'dark' : 'light';
    return themeName === 'green' ? createGreenTheme(mode) : createPurpleTheme(mode);
  }, [themeName, isDarkMode]);

  const contextValue = useMemo(
    () => ({ themeName, toggleTheme, isDarkMode, toggleDarkMode }),
    [themeName, toggleTheme, isDarkMode, toggleDarkMode]
  );

  return (
    <ThemeContext value={contextValue}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ThemeContext>
  );
};
