import type { Theme } from '@mui/material/styles';

import { SkillSummary } from '@/testing';
import { computeShadeColour } from '@/utils/computeShadeColour';
import { CUSTOM_COLOUR_HEX, skillShadeIndex } from '@/utils/skillColour';

import { dotColour } from './SkillItemsList.helpers';

const GREY_400 = '#bdbdbd';
const PRIMARY_MAIN = '#3B6D11';
const mockGetContrastText = jest.fn().mockReturnValue('#ffffff');

const createTheme = (): Theme =>
  ({
    palette: {
      grey: { 400: GREY_400 },
      primary: { main: PRIMARY_MAIN },
      getContrastText: mockGetContrastText,
    },
  }) as unknown as Theme;

describe('dotColour', () => {
  test('returns the default grey when the skill has no colour assigned', () => {
    const skill = new SkillSummary().colour('default').mock();

    expect(dotColour(skill, createTheme())).toBe(GREY_400);
  });

  test('returns a shaded background colour for a skill colour present on the palette', () => {
    const skill = new SkillSummary().skill('React').colour('primary').mock();
    const theme = createTheme();

    const expected = computeShadeColour(
      PRIMARY_MAIN,
      skillShadeIndex(skill.skill),
      theme.palette.getContrastText
    );

    expect(dotColour(skill, theme)).toBe(expected.bg);
  });

  test('returns a shaded background colour for a custom (non-palette) skill colour', () => {
    const skill = new SkillSummary().skill('Team Leadership').colour('brown').mock();
    const theme = createTheme();

    const expected = computeShadeColour(
      CUSTOM_COLOUR_HEX.brown,
      skillShadeIndex(skill.skill),
      theme.palette.getContrastText
    );

    expect(dotColour(skill, theme)).toBe(expected.bg);
  });
});
