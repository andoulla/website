import { createPurpleTheme } from './purple';
import { darkTokens, lightTokens } from './tokens';

describe('createPurpleTheme', () => {
  test('applies light-mode tokens', () => {
    const theme = createPurpleTheme('light');

    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.contrastThreshold).toBe(4.5);
    expect(theme.palette.background).toEqual(lightTokens.background);
    expect(theme.palette.text.secondary).toBe('#7A5A73');
    expect(theme.palette.divider).toBe('#E3D3DD');
    expect(theme.palette.action.focus).toBe('#F8ECF4');
  });

  test('applies dark-mode tokens', () => {
    const theme = createPurpleTheme('dark');

    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.background).toEqual(darkTokens.background);
    expect(theme.palette.text.secondary).toBe('#D9A8CE');
    expect(theme.palette.divider).toBe('#3A2438');
    expect(theme.palette.action.focus).toBe('#3D1F38');
  });
});
