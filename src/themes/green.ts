import { createTheme, responsiveFontSizes } from '@mui/material/styles';

import { baseTokens, darkTokens, lightTokens } from './tokens';

export const createGreenTheme = (mode: 'light' | 'dark') => {
  const tokens = mode === 'light' ? lightTokens : darkTokens;
  return responsiveFontSizes(
    createTheme({
      typography: baseTokens.typography,
      palette: {
        mode,
        // WCAG small-text ratio — stops getContrastText picking sub-4.5:1 white text.
        contrastThreshold: 4.5,
        primary: {
          light: '#9DC46B',
          main: '#3B6D11',
          dark: '#27500A',
          contrastText: '#ffffff',
        },
        secondary: {
          light: '#B5B5AE',
          main: '#2B2B28',
          dark: '#141412',
          contrastText: '#ffffff',
        },
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
