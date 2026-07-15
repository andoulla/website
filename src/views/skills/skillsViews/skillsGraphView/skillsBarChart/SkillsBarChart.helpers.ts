import type { SkillSummary } from '@/utils/calculateSkillYears';
import { hasSearchTerm } from '@/utils/hasSearchTerm';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

import {
  CATEGORY_PATTERN_CSS_BACKGROUND,
  CATEGORY_PATTERN_ORDER,
  type CategoryPatternType,
} from './SkillsBarChart.constants';

// Whether a bar should render at full opacity: no active search, or this skill matches it.
export const isBarMatch = (skill: SkillSummary, searchTerm?: string): boolean =>
  !hasSearchTerm(searchTerm) || skillMatchesSearch(skill, searchTerm);

// Patterns cycle by category position — unlike colours, a repeated texture two categories apart
// is still distinguishable because the colour differs.
export const getCategoryPatternType = (categoryIndex: number): CategoryPatternType =>
  CATEGORY_PATTERN_ORDER[categoryIndex % CATEGORY_PATTERN_ORDER.length];

// SVG <pattern> id for a category's bar fill — shared between its <defs> definition and the Cell using it.
export const getCategoryPatternId = (categoryId: string): string =>
  `skill-bar-pattern-${categoryId}`;

// CSS equivalent of the SVG bar pattern, used for the legend swatch (plain HTML, no SVG needed).
export const getCategoryPatternBackground = (
  categoryIndex: number,
  colour: string,
  markColour: string
): string =>
  CATEGORY_PATTERN_CSS_BACKGROUND[getCategoryPatternType(categoryIndex)](colour, markColour);
