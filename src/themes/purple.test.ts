import { createPurpleTheme } from './purple';
import { darkTokens, lightTokens } from './tokens';

describe('createPurpleTheme', () => {
  test('applies light-mode tokens', () => {
    const theme = createPurpleTheme('light');

    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.background).toEqual(lightTokens.background);
    expect(theme.palette.text.secondary).toBe('#6B5F6B');
    expect(theme.palette.divider).toBe('#DDD6DD');
    expect(theme.palette.action.focus).toBe('#FCE6FC');
  });

  test('applies dark-mode tokens', () => {
    const theme = createPurpleTheme('dark');

    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.background).toEqual(darkTokens.background);
    expect(theme.palette.text.secondary).toBe('#b07ab0');
    expect(theme.palette.divider).toBe('#33203a');
    expect(theme.palette.action.focus).toBe('#2e1030');
  });
});
