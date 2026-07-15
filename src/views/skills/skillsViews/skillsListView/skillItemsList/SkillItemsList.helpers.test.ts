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

  test('returns a shaded background colour for a palette skill colour', () => {
    const skill = new SkillSummary().skill('React').colour('teal').mock();

    const expected = computeShadeColour(
      CUSTOM_COLOUR_HEX.teal.light,
      skillShadeIndex(skill.skill),
      theme.palette.getContrastText
    );

    expect(dotColour(skill, theme)).toBe(expected.bg);
  });

  test('resolves the dark-mode hex for a colour with a dark variant on a dark theme', () => {
    const darkTheme = createTheme({ palette: { mode: 'dark' } });
    const skill = new SkillSummary().skill('Team Leadership').colour('plum').mock();

    const expected = computeShadeColour(
      CUSTOM_COLOUR_HEX.plum.dark,
      skillShadeIndex(skill.skill),
      darkTheme.palette.getContrastText
    );

    expect(dotColour(skill, darkTheme)).toBe(expected.bg);
  });
});
