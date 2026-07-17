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
  return responsiveFontSizes(
    createTheme({
      spacing: spacingByDensity[density],
      typography: createTypographyTokens(density),
      components: createDensityComponents(density),
      palette: {
        mode,
        // WCAG small-text ratio — stops getContrastText picking sub-4.5:1 white text.
        contrastThreshold: 4.5,
        primary: {
          light: '#E9C7E3',
          main: '#702963',
          dark: '#4A1240',
          contrastText: '#ffffff',
        },
        secondary: {
          light: '#E3D3DD',
          main: '#7A5A73',
          dark: '#3A1F35',
          contrastText: '#ffffff',
        },
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
