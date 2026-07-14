import type { SkillCategory } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { hasSearchTerm } from '@/utils/hasSearchTerm';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

import { CATEGORY_PATTERN_CSS_BACKGROUND, CATEGORY_PATTERN_TYPE } from './SkillsBarChart.constants';

// Whether a bar should render at full opacity: no active search, or this skill matches it.
export const isBarMatch = (skill: SkillSummary, searchTerm?: string): boolean =>
  !hasSearchTerm(searchTerm) || skillMatchesSearch(skill, searchTerm);

// SVG <pattern> id for a category's bar fill — shared between its <defs> definition and the Cell using it.
export const getCategoryPatternId = (category: SkillCategory): string =>
  `skill-bar-pattern-${category}`;

// CSS equivalent of the SVG bar pattern, used for the legend swatch (plain HTML, no SVG needed).
export const getCategoryPatternBackground = (
  category: SkillCategory,
  colour: string,
  markColour: string
): string => CATEGORY_PATTERN_CSS_BACKGROUND[CATEGORY_PATTERN_TYPE[category]](colour, markColour);
