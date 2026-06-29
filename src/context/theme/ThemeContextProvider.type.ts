import type { ReactNode } from 'react';

export type ThemeName = 'green' | 'purple';

export interface ThemeContextValue {
  themeName: ThemeName;
  toggleTheme: () => void;
}

export interface ThemeContextProviderProps {
  children: ReactNode;
  initialTheme?: ThemeName;
}
