import type { CustomSkillColour, SkillCategory, SkillColour } from './skillColour.types';

// Fixed hex for each CustomSkillColour — picked to stay clear of red/orange/blue/grey (rejected:
// too close to MUI's warning/error/info, or too washed-out against the chart's grid/axis lines)
// and of both themes' primary/secondary (see src/themes/*.ts) so a category never blends into the
// active theme's own accent colour.
export const CUSTOM_COLOUR_HEX: Record<CustomSkillColour, string> = {
  teal: '#00897B',
  plum: '#7B4B94',
  brown: '#8D6E63',
  gold: '#B08D1E',
};

// 'success' is the one MUI-named colour kept: it's theme-invariant (not customized per theme) and
// doesn't clash with anything else in this map. Everything else is a CustomSkillColour above —
// 'primary'/'secondary' are theme-customized (risk of coinciding with a fixed colour, as
// 'success' green already nearly does with the green theme's primary), and 'info'/'warning'/
// 'error'/'default' were the red/orange/blue/grey the palette was picked to avoid.
export const CATEGORY_COLOUR_MAP: Record<SkillCategory, SkillColour> = {
  engineering: 'teal',
  'quality-performance': 'success',
  tooling: 'plum',
  'leadership-delivery': 'brown',
  'people-stakeholders': 'gold',
};
