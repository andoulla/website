const headingFontFamily = '"Manrope", sans-serif';
const bodyFontFamily = '"Inter", sans-serif';

export type Density = 'comfortable' | 'compact';

// Comfortable = the original larger-font scale; compact shrinks each role one step.
const fontSizesByDensity = {
  comfortable: {
    h1: '2.75rem',
    h2: '2.125rem',
    h3: '1.75rem',
    h4: '1.375rem',
    h5: '1.25rem',
    h6: '1.125rem',
    subtitle1: '1.125rem',
    subtitle2: '1rem',
    body1: '1.125rem',
    body2: '1rem',
    button: '1rem',
    caption: '0.875rem',
    overline: '0.75rem',
  },
  compact: {
    h1: '2.25rem',
    h2: '1.75rem',
    h3: '1.5rem',
    h4: '1.25rem',
    h5: '1.125rem',
    h6: '1rem',
    subtitle1: '1rem',
    subtitle2: '0.875rem',
    body1: '1rem',
    body2: '0.875rem',
    button: '0.875rem',
    caption: '0.75rem',
    overline: '0.6875rem',
  },
} as const;

export const createTypographyTokens = (density: Density) => {
  const sizes = fontSizesByDensity[density];
  return {
    fontFamily: bodyFontFamily,
    h1: { fontFamily: headingFontFamily, fontWeight: 800, fontSize: sizes.h1, lineHeight: 1.2 },
    h2: { fontFamily: headingFontFamily, fontWeight: 700, fontSize: sizes.h2, lineHeight: 1.25 },
    h3: { fontFamily: headingFontFamily, fontWeight: 700, fontSize: sizes.h3, lineHeight: 1.3 },
    h4: { fontFamily: headingFontFamily, fontWeight: 700, fontSize: sizes.h4, lineHeight: 1.35 },
    h5: { fontFamily: headingFontFamily, fontWeight: 600, fontSize: sizes.h5, lineHeight: 1.4 },
    h6: { fontFamily: headingFontFamily, fontWeight: 600, fontSize: sizes.h6, lineHeight: 1.4 },
    subtitle1: { fontFamily: bodyFontFamily, fontWeight: 500, fontSize: sizes.subtitle1 },
    subtitle2: { fontFamily: bodyFontFamily, fontWeight: 500, fontSize: sizes.subtitle2 },
    body1: { fontFamily: bodyFontFamily, fontWeight: 400, fontSize: sizes.body1, lineHeight: 1.6 },
    body2: { fontFamily: bodyFontFamily, fontWeight: 400, fontSize: sizes.body2, lineHeight: 1.6 },
    button: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
      fontSize: sizes.button,
      textTransform: 'none' as const,
    },
    caption: { fontFamily: bodyFontFamily, fontWeight: 400, fontSize: sizes.caption },
    overline: { fontFamily: bodyFontFamily, fontWeight: 600, fontSize: sizes.overline },
  };
};

export const spacingByDensity: Record<Density, number> = { comfortable: 8, compact: 7 };

// Compact tightens component defaults; comfortable keeps MUI's own.
export const createDensityComponents = (density: Density) => {
  if (density === 'comfortable') return {};
  return {
    MuiChip: { defaultProps: { size: 'small' as const } },
    MuiCardContent: {
      styleOverrides: { root: { padding: 12, '&:last-child': { paddingBottom: 12 } } },
    },
  };
};

export const lightTokens = {
  background: { default: '#f8fafc', paper: '#ffffff' },
  text: { primary: '#0f172a', disabled: '#AFA5AF' },
} as const;

export const darkTokens = {
  // Softer than near-black — avoids the harsh/OLED-smear look of a true dark background.
  background: { default: '#16181d', paper: '#1e2128' },
  text: { primary: '#f1f5f9', disabled: '#64748b' },
} as const;
