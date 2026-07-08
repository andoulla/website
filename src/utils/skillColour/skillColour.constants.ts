import type { CustomSkillColour, SkillCategory, SkillColour } from './skillColour.types';

// Avoids red/orange/blue/grey (MUI warning/error/info, or washed-out on grid/axis lines) and
// both themes' primary/secondary (src/themes/*.ts), so a category never blends into the theme.
export const CUSTOM_COLOUR_HEX: Record<CustomSkillColour, string> = {
  teal: '#00897B',
  plum: '#7B4B94',
  brown: '#8D6E63',
  gold: '#B08D1E',
};

// 'success' is the only MUI-named colour kept: theme-invariant and clash-free here.
// 'primary'/'secondary' are theme-customized (risk of coinciding with a fixed colour); the rest
// are the red/orange/blue/grey the palette above avoids.
export const CATEGORY_COLOUR_MAP: Record<SkillCategory, SkillColour> = {
  engineering: 'teal',
  'quality-performance': 'success',
  tooling: 'plum',
  'leadership-delivery': 'brown',
  'people-stakeholders': 'gold',
};
