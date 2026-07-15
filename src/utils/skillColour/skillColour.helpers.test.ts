import type { Theme } from '@mui/material/styles';

import { CATEGORY_COLOUR_PALETTE, CUSTOM_COLOUR_HEX } from './skillColour.constants';
import {
  categoryColourFromIndex,
  resolveSkillColourMain,
  skillShadeIndex,
} from './skillColour.helpers';

describe('categoryColourFromIndex', () => {
  test('returns the palette colour at the given index', () => {
    expect(categoryColourFromIndex(0)).toBe('teal');
    expect(categoryColourFromIndex(6)).toBe('berry');
  });

  test('falls back to default for an index beyond the palette', () => {
    expect(categoryColourFromIndex(CATEGORY_COLOUR_PALETTE.length)).toBe('default');
  });
});

describe('skillShadeIndex', () => {
  test('returns a number between 0 and 5 inclusive', () => {
    const idx = skillShadeIndex('React');

    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThanOrEqual(5);
  });

  test('always returns the same index for the same skill', () => {
    expect(skillShadeIndex('TypeScript')).toBe(skillShadeIndex('TypeScript'));
    expect(skillShadeIndex('Mentoring')).toBe(skillShadeIndex('Mentoring'));
  });

  test('returns the exact index for a known skill name', () => {
    // 'React' char codes sum to 495 (82+101+97+99+116); 495 % 6 = 3.
    expect(skillShadeIndex('React')).toBe(3);
  });

  test('returns 0 for an empty skill name', () => {
    expect(skillShadeIndex('')).toBe(0);
  });
});

describe('resolveSkillColourMain', () => {
  const GREY_400 = '#bdbdbd';

  const createTheme = (mode: 'light' | 'dark'): Theme =>
    ({
      palette: {
        mode,
        grey: { 400: GREY_400 },
      },
    }) as unknown as Theme;

  test('returns grey for the default colour', () => {
    expect(resolveSkillColourMain('default', createTheme('light'))).toBe(GREY_400);
  });

  test('returns the light-mode hex for a custom colour on a light theme', () => {
    expect(resolveSkillColourMain('plum', createTheme('light'))).toBe(CUSTOM_COLOUR_HEX.plum.light);
  });

  test('returns the dark-mode hex for a custom colour on a dark theme', () => {
    expect(resolveSkillColourMain('plum', createTheme('dark'))).toBe(CUSTOM_COLOUR_HEX.plum.dark);
  });
});
