import type { ReactNode } from 'react';

export type ThemeName = 'green' | 'purple';

export interface ThemeContextValue {
  themeName: ThemeName;
  toggleTheme: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export interface ThemeContextProviderProps {
  children: ReactNode;
  initialTheme?: ThemeName;
  initialDarkMode?: boolean;
}
