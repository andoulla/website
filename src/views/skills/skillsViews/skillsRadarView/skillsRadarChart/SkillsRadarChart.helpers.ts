import type { Theme } from '@mui/material/styles';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import type { PresentCategory } from '@/utils/derivePresentCategories';
import { hasSearchTerm } from '@/utils/hasSearchTerm';
import { categoryColourFromIndex, resolveSkillColourMain } from '@/utils/skillColour';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

import type { CategoryRadarPoint } from './SkillsRadarChart.types';

// Matching vertices keep their category hue; non-matching dim to the disabled colour.
export const resolveDotColour = (point: CategoryRadarPoint, theme: Theme): string =>
  point.isMatch
    ? resolveSkillColourMain(categoryColourFromIndex(point.categoryIndex), theme)
    : theme.palette.action.disabled;

export const formatAxisTick = (value: number): string => `${value}y`;

// One point per present category, even at 0 skills — keeps the axis set stable under filters.
// Averaged, not summed: skills overlap in time, so summing inflates past a real career length.
export const aggregateSkillsByCategory = (
  categories: PresentCategory[],
  skills: SkillSummary[],
  searchTerm?: string
): CategoryRadarPoint[] =>
  categories.map((category) => {
    const categorySkills = skills.filter((skill) => skill.categoryId === category.id);
    const totalYears = categorySkills.reduce((total, skill) => total + skill.years, 0);
    const avgYears =
      categorySkills.length > 0 ? Math.round((totalYears / categorySkills.length) * 10) / 10 : 0;
    const isMatch =
      !hasSearchTerm(searchTerm) ||
      categorySkills.some((skill) => skillMatchesSearch(skill, searchTerm));

    return {
      categoryId: category.id,
      categoryIndex: category.index,
      label: category.name,
      avgYears,
      skillCount: categorySkills.length,
      isMatch,
    };
  });
