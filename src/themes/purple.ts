import { createTheme, responsiveFontSizes } from '@mui/material/styles';

import { baseTokens, darkTokens, lightTokens } from './tokens';

export const createPurpleTheme = (mode: 'light' | 'dark') => {
  const tokens = mode === 'light' ? lightTokens : darkTokens;
  return responsiveFontSizes(
    createTheme({
      typography: baseTokens.typography,
      palette: {
        mode,
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
