import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';

export const filterSkillsByCategory = (
  skills: SkillSummary[],
  selectedCategories: SkillCategory[],
  selectedSubCategories: SkillSubCategory[]
): SkillSummary[] => {
  if (selectedCategories.length === 0 && selectedSubCategories.length === 0) return skills;

  return skills.filter(
    (s) =>
      (selectedCategories.length === 0 || selectedCategories.includes(s.category)) &&
      (selectedSubCategories.length === 0 || selectedSubCategories.includes(s.subCategory))
  );
};
