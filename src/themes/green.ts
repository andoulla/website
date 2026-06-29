import { createTheme } from '@mui/material/styles';

import { baseTokens } from './tokens';

export const greenTheme = createTheme({
  typography: baseTokens.typography,
  palette: {
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
    background: baseTokens.background,
    text: {
      ...baseTokens.text,
      secondary: '#6E6E68',
    },
    divider: '#E0E0DB',
    action: { focus: '#EEF4E6' },
  },
});
