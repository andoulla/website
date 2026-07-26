import {
  CATEGORY_PATTERN_CSS_BACKGROUND,
  CATEGORY_PATTERN_ORDER,
  type CategoryPatternType,
} from './categoryPattern.constants';

// Patterns cycle by category position — unlike colours, a repeated texture two categories apart
// is still distinguishable because the colour differs.
export const getCategoryPatternType = (categoryIndex: number): CategoryPatternType =>
  CATEGORY_PATTERN_ORDER[categoryIndex % CATEGORY_PATTERN_ORDER.length];

// SVG <pattern> id for a category's fill — shared between its <defs> definition and the cell using it.
export const getCategoryPatternId = (categoryId: string): string =>
  `skill-bar-pattern-${categoryId}`;

// CSS equivalent of the SVG pattern, used for legend swatches (plain HTML, no SVG needed).
export const getCategoryPatternBackground = (
  categoryIndex: number,
  colour: string,
  markColour: string
): string =>
  CATEGORY_PATTERN_CSS_BACKGROUND[getCategoryPatternType(categoryIndex)](colour, markColour);
