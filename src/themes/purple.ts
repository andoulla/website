import { createTheme, responsiveFontSizes } from '@mui/material/styles';

import {
  createDensityComponents,
  createTypographyTokens,
  darkTokens,
  lightTokens,
  spacingByDensity,
} from './tokens';
import type { Density } from './tokens';

export const createPurpleTheme = (mode: 'light' | 'dark', density: Density) => {
  const tokens = mode === 'light' ? lightTokens : darkTokens;
  // Dark mode flips to light-toned accents with dark-ink text; every main ≥ 4.5:1 on both surfaces.
  const primary =
    mode === 'light'
      ? { light: '#E9C7E3', main: '#702963', dark: '#4A1240', contrastText: '#ffffff' }
      : { light: '#E9C7E3', main: '#D48FC4', dark: '#A95E96', contrastText: '#33102C' };
  const secondary =
    mode === 'light'
      ? { light: '#E3D3DD', main: '#6E6470', dark: '#3A1F35', contrastText: '#ffffff' }
      : { light: '#D0BFC9', main: '#AE95A6', dark: '#7E6577', contrastText: '#241A20' };
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
          secondary: mode === 'light' ? '#7A5A73' : '#D9A8CE',
        },
        divider: mode === 'light' ? '#E3D3DD' : '#3A2438',
        action: { focus: mode === 'light' ? '#F8ECF4' : '#3D1F38' },
      },
    })
  );
};
