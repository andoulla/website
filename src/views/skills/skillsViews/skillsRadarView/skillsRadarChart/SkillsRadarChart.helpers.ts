import type { SkillCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { CATEGORY_LABELS } from '@/utils/skillCategory';
import { isSearchTermEmpty, skillMatchesSearch } from '@/utils/skillMatchesSearch';

import type { CategoryRadarPoint } from './SkillsRadarChart.types';

// One point per category, even at 0 skills — keeps all 4 axes; filtered-out categories total 0.
export const aggregateSkillsByCategory = (
  categories: SkillCategory[],
  skills: SkillSummary[],
  searchTerm?: string
): CategoryRadarPoint[] =>
  categories.map((category) => {
    const categorySkills = skills.filter((skill) => skill.category === category);
    const totalYears = categorySkills.reduce((total, skill) => total + skill.years, 0);
    const years = Math.round(totalYears * 10) / 10;
    // No search term = match by default.
    const isMatch =
      isSearchTermEmpty(searchTerm) ||
      (searchTerm !== undefined &&
        categorySkills.some((skill) => skillMatchesSearch(skill, searchTerm)));

    return {
      category,
      label: CATEGORY_LABELS[category],
      years,
      skillCount: categorySkills.length,
      isMatch,
    };
  });
