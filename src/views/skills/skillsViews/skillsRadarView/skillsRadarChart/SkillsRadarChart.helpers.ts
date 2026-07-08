import type { SkillCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { isSearchTermEmpty } from '@/utils/isSearchTermEmpty';
import { CATEGORY_LABELS } from '@/utils/skillCategory';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

import type { CategoryRadarPoint } from './SkillsRadarChart.types';

// One point per category, even at 0 skills — keeps all 5 axes stable under filters.
// Averaged, not summed: skills overlap in time, so summing inflates past a real career length.
export const aggregateSkillsByCategory = (
  categories: SkillCategory[],
  skills: SkillSummary[],
  searchTerm?: string
): CategoryRadarPoint[] =>
  categories.map((category) => {
    const categorySkills = skills.filter((skill) => skill.category === category);
    const totalYears = categorySkills.reduce((total, skill) => total + skill.years, 0);
    const avgYears =
      categorySkills.length > 0 ? Math.round((totalYears / categorySkills.length) * 10) / 10 : 0;
    const isMatch =
      isSearchTermEmpty(searchTerm) ||
      (searchTerm !== undefined &&
        categorySkills.some((skill) => skillMatchesSearch(skill, searchTerm)));

    return {
      category,
      label: CATEGORY_LABELS[category],
      avgYears,
      skillCount: categorySkills.length,
      isMatch,
    };
  });
