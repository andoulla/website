import type { ThemeName } from './ThemeContextProvider.types';

// Storage access wrapped in try/catch — localStorage can throw (e.g. private-mode Safari);
// the preference then simply doesn't persist.
const THEME_NAME_STORAGE_KEY = 'theme-name';
const DARK_MODE_STORAGE_KEY = 'dark-mode';

export const readStoredThemeName = (): ThemeName | undefined => {
  try {
    const stored = window.localStorage.getItem(THEME_NAME_STORAGE_KEY);
    return stored === 'green' || stored === 'purple' ? stored : undefined;
  } catch {
    return undefined;
  }
};

export const storeThemeName = (themeName: ThemeName): void => {
  try {
    window.localStorage.setItem(THEME_NAME_STORAGE_KEY, themeName);
  } catch {
    // Storage unavailable — nothing to do.
  }
};

export const readStoredDarkMode = (): boolean | undefined => {
  try {
    const stored = window.localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return undefined;
  } catch {
    return undefined;
  }
};

export const storeDarkMode = (isDarkMode: boolean): void => {
  try {
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDarkMode));
  } catch {
    // Storage unavailable — nothing to do.
  }
};

export const prefersDarkColourScheme = (): boolean =>
  window.matchMedia('(prefers-color-scheme: dark)').matches;
