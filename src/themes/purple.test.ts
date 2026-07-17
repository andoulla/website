import { createPurpleTheme } from './purple';
import { createTypographyTokens, darkTokens, lightTokens } from './tokens';

describe('createPurpleTheme', () => {
  test('applies light-mode tokens', () => {
    const theme = createPurpleTheme('light', 'comfortable');

    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.contrastThreshold).toBe(4.5);
    expect(theme.palette.background).toEqual(lightTokens.background);
    expect(theme.palette.text.secondary).toBe('#7A5A73');
    expect(theme.palette.divider).toBe('#E3D3DD');
    expect(theme.palette.action.focus).toBe('#F8ECF4');
  });

  test('applies dark-mode tokens', () => {
    const theme = createPurpleTheme('dark', 'comfortable');

    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.background).toEqual(darkTokens.background);
    expect(theme.palette.text.secondary).toBe('#D9A8CE');
    expect(theme.palette.divider).toBe('#3A2438');
    expect(theme.palette.action.focus).toBe('#3D1F38');
  });

  test('compact density shrinks the type scale, spacing unit, and component defaults', () => {
    const comfortable = createPurpleTheme('light', 'comfortable');
    const compact = createPurpleTheme('light', 'compact');

    // Type scale asserted on the tokens — responsiveFontSizes rewrites the built theme's
    // base fontSize to the smallest-breakpoint value.
    expect(createTypographyTokens('comfortable').body1.fontSize).toBe('1.125rem');
    expect(createTypographyTokens('compact').body1.fontSize).toBe('1rem');
    expect(comfortable.spacing(1)).toBe('8px');
    expect(compact.spacing(1)).toBe('7px');
    expect(comfortable.components?.MuiChip).toBeUndefined();
    expect(compact.components?.MuiChip?.defaultProps?.size).toBe('small');
  });
});
