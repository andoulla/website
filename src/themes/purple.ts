import { createTheme } from '@mui/material/styles';

import { baseTokens } from './tokens';

export const purpleTheme = createTheme({
  typography: baseTokens.typography,
  palette: {
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
    background: baseTokens.background,
    text: {
      ...baseTokens.text,
      secondary: '#6B5F6B',
    },
    divider: '#DDD6DD',
    action: { focus: '#FCE6FC' },
  },
});
