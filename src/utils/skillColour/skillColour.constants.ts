import type { CustomSkillColour, SkillCategory, SkillColour } from './skillColour.types';

// Avoids red/orange/blue/grey (MUI warning/error/info, or washed-out on grid/axis lines) and
// both themes' primary/secondary (src/themes/*.ts), so a category never blends into the theme.
// Per-mode hexes: dark variants lift the colours that fail 3:1 contrast on the dark surface.
export const CUSTOM_COLOUR_HEX: Record<CustomSkillColour, { light: string; dark: string }> = {
  teal: { light: '#00897B', dark: '#00897B' },
  green: { light: '#2e7d32', dark: '#43A047' },
  plum: { light: '#7B4B94', dark: '#8E5CAD' },
  brown: { light: '#9A5B2F', dark: '#9A5B2F' },
  gold: { light: '#B08D1E', dark: '#B08D1E' },
  indigo: { light: '#4E5FBF', dark: '#5C6DD2' },
  berry: { light: '#B03060', dark: '#C74A7B' },
};

// Fixed assignment order for track categories, by position in the track file. Duplicate hues are
// a dataviz anti-pattern, so there is no modulo cycling — an index beyond the palette falls back
// to the 'default' grey (see categoryColourFromIndex).
export const CATEGORY_COLOUR_PALETTE: SkillColour[] = [
  'teal',
  'green',
  'plum',
  'brown',
  'gold',
  'indigo',
  'berry',
];

// Legacy map for the old fixed taxonomy — still drives the resume card's chip colours until the
// track-aware card grouping lands; dies with the legacy category fields.
export const CATEGORY_COLOUR_MAP: Record<SkillCategory, SkillColour> = {
  engineering: 'teal',
  'quality-performance': 'green',
  tooling: 'plum',
  'leadership-delivery': 'brown',
  'people-stakeholders': 'gold',
};
