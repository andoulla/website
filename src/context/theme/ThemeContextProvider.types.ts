import type { ReactNode } from 'react';

import type { Density } from '@/themes';

export type ThemeName = 'green' | 'purple';

export interface ThemeContextValue {
  themeName: ThemeName;
  toggleTheme: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  density: Density;
  toggleDensity: () => void;
}

export interface ThemeContextProviderProps {
  children: ReactNode;
  initialTheme?: ThemeName;
  initialDarkMode?: boolean;
  initialDensity?: Density;
}
