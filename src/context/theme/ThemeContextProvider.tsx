import { ThemeProvider } from '@mui/material/styles';
import { createContext, use, useState } from 'react';

import { greenTheme, purpleTheme } from '../../themes';

import type {
  ThemeContextProviderProps,
  ThemeContextValue,
  ThemeName,
} from './ThemeContextProvider.type';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeContext(): ThemeContextValue {
  const ctx = use(ThemeContext);
  if (ctx === null) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return ctx;
}

export function ThemeContextProvider({
  children,
  initialTheme = 'green',
}: ThemeContextProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);
  const toggleTheme = () => setThemeName((n) => (n === 'green' ? 'purple' : 'green'));
  const muiTheme = themeName === 'green' ? greenTheme : purpleTheme;

  return (
    <ThemeContext value={{ themeName, toggleTheme }}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ThemeContext>
  );
}
