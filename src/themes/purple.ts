import { createTheme } from '@mui/material/styles';

import { baseTokens, darkTokens, lightTokens } from './tokens';

export function createPurpleTheme(mode: 'light' | 'dark') {
  const tokens = mode === 'light' ? lightTokens : darkTokens;
  return createTheme({
    typography: baseTokens.typography,
    palette: {
      mode,
      primary: {
        light: '#DC6FDB',
        main: '#A300A3',
        dark: '#7A007A',
        contrastText: '#ffffff',
      },
      secondary: {
        light: '#DDD6DD',
        main: '#6B5F6B',
        dark: '#2A222A',
        contrastText: '#ffffff',
      },
      background: tokens.background,
      text: {
        ...tokens.text,
        secondary: mode === 'light' ? '#6B5F6B' : '#b07ab0',
      },
      divider: mode === 'light' ? '#DDD6DD' : '#33203a',
      action: { focus: mode === 'light' ? '#FCE6FC' : '#2e1030' },
    },
  });
}
