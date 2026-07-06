import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';

// Narrows `skills` down to the selected categories/subcategories (AND semantics between the two).
export const filterSkillsByCategory = (
  skills: SkillSummary[],
  selectedCategories: SkillCategory[],
  selectedSubCategories: SkillSubCategory[]
): SkillSummary[] => {
  // No filters active — nothing to narrow down.
  if (selectedCategories.length === 0 && selectedSubCategories.length === 0) return skills;

  // Keep a skill only if it matches a selected category (when any are selected) and a selected
  // subcategory (when any are selected).
  return skills.filter(
    (skill) =>
      (selectedCategories.length === 0 || selectedCategories.includes(skill.category)) &&
      (selectedSubCategories.length === 0 || selectedSubCategories.includes(skill.subCategory))
  );
};
