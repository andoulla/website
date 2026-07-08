import type { SkillCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

// Whether a bar should render at full opacity: no active search, or this skill matches it.
export const isBarMatch = (skill: SkillSummary, searchTerm?: string): boolean =>
  searchTerm === undefined || searchTerm.trim() === '' || skillMatchesSearch(skill, searchTerm);

// Texture per category, layered on top of colour, so bars and legend keys stay distinguishable
// for colour-blind/low-vision users without relying on hue alone.
type CategoryPatternKind = 'diagonal' | 'vertical' | 'crosshatch' | 'dots';

export const CATEGORY_PATTERN_KIND: Record<SkillCategory, CategoryPatternKind> = {
  engineering: 'diagonal',
  managerial: 'vertical',
  'soft-skills': 'crosshatch',
  other: 'dots',
};

// SVG <pattern> id for a category's bar fill — shared between its <defs> definition and the Cell using it.
export const getCategoryPatternId = (category: SkillCategory): string =>
  `skill-bar-pattern-${category}`;

// CSS equivalent of the SVG bar pattern, used for the legend swatch (plain HTML, no SVG needed).
export const getCategoryPatternBackground = (
  category: SkillCategory,
  colour: string,
  markColour: string
): string => {
  switch (CATEGORY_PATTERN_KIND[category]) {
    case 'diagonal':
      return (
        `repeating-linear-gradient(45deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 4px), ` +
        colour
      );
    case 'vertical':
      return (
        `repeating-linear-gradient(90deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 4px), ` +
        colour
      );
    case 'crosshatch':
      return (
        `repeating-linear-gradient(45deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 5px), ` +
        `repeating-linear-gradient(-45deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 5px), ` +
        colour
      );
    case 'dots':
      return `radial-gradient(${markColour} 30%, transparent 30%) 0 0 / 6px 6px, ${colour}`;
  }
};
