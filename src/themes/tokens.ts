const headingFontFamily = '"Manrope", sans-serif';
const bodyFontFamily = '"Inter", sans-serif';

export const baseTokens = {
  typography: {
    fontFamily: bodyFontFamily,
    h1: { fontFamily: headingFontFamily, fontWeight: 800, fontSize: '2.75rem', lineHeight: 1.2 },
    h2: { fontFamily: headingFontFamily, fontWeight: 700, fontSize: '2.125rem', lineHeight: 1.25 },
    h3: { fontFamily: headingFontFamily, fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.3 },
    h4: { fontFamily: headingFontFamily, fontWeight: 700, fontSize: '1.375rem', lineHeight: 1.35 },
    h5: { fontFamily: headingFontFamily, fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    h6: { fontFamily: headingFontFamily, fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    subtitle1: { fontFamily: bodyFontFamily, fontWeight: 500, fontSize: '1.125rem' },
    subtitle2: { fontFamily: bodyFontFamily, fontWeight: 500, fontSize: '1rem' },
    body1: { fontFamily: bodyFontFamily, fontWeight: 400, fontSize: '1.125rem', lineHeight: 1.6 },
    body2: { fontFamily: bodyFontFamily, fontWeight: 400, fontSize: '1rem', lineHeight: 1.6 },
    button: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
      fontSize: '1rem',
      textTransform: 'none',
    },
    caption: { fontFamily: bodyFontFamily, fontWeight: 400, fontSize: '0.875rem' },
    overline: { fontFamily: bodyFontFamily, fontWeight: 600, fontSize: '0.75rem' },
  },
} as const;

export const lightTokens = {
  background: { default: '#f8fafc', paper: '#ffffff' },
  text: { primary: '#0f172a', disabled: '#AFA5AF' },
} as const;

export const darkTokens = {
  background: { default: '#0f1117', paper: '#1a1d24' },
  text: { primary: '#f1f5f9', disabled: '#64748b' },
} as const;
