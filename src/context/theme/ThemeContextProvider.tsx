import { ThemeProvider } from '@mui/material/styles';
import { createContext, use, useCallback, useMemo, useState } from 'react';

import { createGreenTheme, createPurpleTheme } from '@/themes';

import type {
  ThemeContextProviderProps,
  ThemeContextValue,
  ThemeName,
} from './ThemeContextProvider.type';

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
  initialTheme = 'green',
  initialDarkMode = false,
}: ThemeContextProviderProps) => {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);

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
