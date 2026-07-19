import { createGreenTheme } from './green';
import { darkTokens, lightTokens } from './tokens';

describe('createGreenTheme', () => {
  test('applies light-mode tokens', () => {
    const theme = createGreenTheme('light', 'comfortable');

    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.contrastThreshold).toBe(4.5);
    expect(theme.palette.background).toEqual(lightTokens.background);
    expect(theme.palette.primary.main).toBe('#3B6D11');
    expect(theme.palette.secondary.main).toBe('#6E6E68');
    expect(theme.palette.text.secondary).toBe('#6E6E68');
    expect(theme.palette.divider).toBe('#E0E0DB');
    expect(theme.palette.action.focus).toBe('#EEF4E6');
  });

  test('applies dark-mode tokens', () => {
    const theme = createGreenTheme('dark', 'compact');

    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.background).toEqual(darkTokens.background);
    expect(theme.palette.primary.main).toBe('#9DC46B');
    expect(theme.palette.secondary.main).toBe('#A9ADA2');
    expect(theme.palette.text.secondary).toBe('#8fba78');
    expect(theme.palette.divider).toBe('#243318');
    expect(theme.palette.action.focus).toBe('#1a3010');
  });
});
