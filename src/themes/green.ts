import { createTheme, responsiveFontSizes } from '@mui/material/styles';

import {
  createDensityComponents,
  createTypographyTokens,
  darkTokens,
  lightTokens,
  spacingByDensity,
} from './tokens';
import type { Density } from './tokens';

export const createGreenTheme = (mode: 'light' | 'dark', density: Density) => {
  const tokens = mode === 'light' ? lightTokens : darkTokens;
  // Dark mode flips to light-toned accents with dark-ink text; every main ≥ 4.5:1 on both surfaces.
  const primary =
    mode === 'light'
      ? { light: '#9DC46B', main: '#3B6D11', dark: '#27500A', contrastText: '#ffffff' }
      : { light: '#C3DC9E', main: '#9DC46B', dark: '#729A3F', contrastText: '#1A2609' };
  const secondary =
    mode === 'light'
      ? { light: '#B5B5AE', main: '#6E6E68', dark: '#2B2B28', contrastText: '#ffffff' }
      : { light: '#C9CCC2', main: '#A9ADA2', dark: '#7A7E72', contrastText: '#1C1E18' };
  return responsiveFontSizes(
    createTheme({
      density,
      spacing: spacingByDensity[density],
      typography: createTypographyTokens(density),
      components: createDensityComponents(density),
      palette: {
        mode,
        // WCAG small-text ratio — stops getContrastText picking sub-4.5:1 white text.
        contrastThreshold: 4.5,
        primary,
        secondary,
        background: tokens.background,
        text: {
          ...tokens.text,
          secondary: mode === 'light' ? '#6E6E68' : '#8fba78',
        },
        divider: mode === 'light' ? '#E0E0DB' : '#243318',
        action: { focus: mode === 'light' ? '#EEF4E6' : '#1a3010' },
      },
    })
  );
};
