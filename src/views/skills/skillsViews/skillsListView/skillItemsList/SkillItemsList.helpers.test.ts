import { createTheme } from '@mui/material/styles';

import { SkillSummary } from '@/testing';
import { computeShadeColour } from '@/utils/computeShadeColour';
import { CUSTOM_COLOUR_HEX, skillShadeIndex } from '@/utils/skillColour';

import { dotColour } from './SkillItemsList.helpers';

const theme = createTheme();

describe('dotColour', () => {
  test('returns the default grey when the skill has no colour assigned', () => {
    const skill = new SkillSummary().colour('default').mock();

    expect(dotColour(skill, theme)).toBe(theme.palette.grey[400]);
  });

  test('returns a shaded background colour for a skill colour present on the palette', () => {
    const skill = new SkillSummary().skill('React').colour('primary').mock();

    const expected = computeShadeColour(
      theme.palette.primary.main,
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
