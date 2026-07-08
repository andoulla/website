import type { Theme } from '@mui/material/styles';

import { CUSTOM_COLOUR_HEX } from './skillColour.constants';
import {
  resolveSkillColourMain,
  skillCategory,
  skillColour,
  skillShadeIndex,
} from './skillColour.helpers';

describe('skillColour', () => {
  test('engineering skills map to teal', () => {
    expect(skillColour('React')).toBe('teal');
    expect(skillColour('TypeScript')).toBe('teal');
  });

  test('leadership & delivery skills map to brown', () => {
    expect(skillColour('Team Leadership')).toBe('brown');
    expect(skillColour('Roadmap Planning')).toBe('brown');
  });

  test('people & stakeholders skills map to gold', () => {
    expect(skillColour('Mentoring')).toBe('gold');
    expect(skillColour('Team Onboarding')).toBe('gold');
  });

  test('unknown skills map to plum (the tooling fallback)', () => {
    expect(skillColour('Rust')).toBe('plum');
    expect(skillColour('Cobol')).toBe('plum');
  });

  test('always returns the same colour for the same skill', () => {
    expect(skillColour('GraphQL')).toBe(skillColour('GraphQL'));
    expect(skillColour('Rust')).toBe(skillColour('Rust'));
  });
});

describe('skillCategory', () => {
  test('returns the correct category for known skills', () => {
    expect(skillCategory('React')).toBe('engineering');
    expect(skillCategory('Team Leadership')).toBe('leadership-delivery');
    expect(skillCategory('Mentoring')).toBe('people-stakeholders');
  });

  test('returns tooling for unknown skills', () => {
    expect(skillCategory('Rust')).toBe('tooling');
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
  const PRIMARY_MAIN = '#3B6D11';

  const createTheme = (): Theme =>
    ({
      palette: {
        grey: { 400: GREY_400 },
        primary: { main: PRIMARY_MAIN },
      },
    }) as unknown as Theme;

  test('returns grey for the default colour', () => {
    expect(resolveSkillColourMain('default', createTheme())).toBe(GREY_400);
  });

  test('returns the palette main for a recognised colour', () => {
    expect(resolveSkillColourMain('primary', createTheme())).toBe(PRIMARY_MAIN);
  });

  test('returns the fixed hex for a custom colour, bypassing the theme palette', () => {
    expect(resolveSkillColourMain('teal', createTheme())).toBe(CUSTOM_COLOUR_HEX.teal);
  });
});
