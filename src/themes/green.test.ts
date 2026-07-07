import { createGreenTheme } from './green';
import { darkTokens, lightTokens } from './tokens';

describe('createGreenTheme', () => {
  test('applies light-mode tokens', () => {
    const theme = createGreenTheme('light');

    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.background).toEqual(lightTokens.background);
    expect(theme.palette.text.secondary).toBe('#6E6E68');
    expect(theme.palette.divider).toBe('#E0E0DB');
    expect(theme.palette.action.focus).toBe('#EEF4E6');
  });

  test('applies dark-mode tokens', () => {
    const theme = createGreenTheme('dark');

    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.background).toEqual(darkTokens.background);
    expect(theme.palette.text.secondary).toBe('#8fba78');
    expect(theme.palette.divider).toBe('#243318');
    expect(theme.palette.action.focus).toBe('#1a3010');
  });
});
