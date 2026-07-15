import type { SkillSummary } from '@/utils/calculateSkillYears';

import type { PresentCategory } from './derivePresentCategories.types';

// One entry per category that has at least one summary, ordered by track category position.
export const derivePresentCategories = (skills: SkillSummary[]): PresentCategory[] => {
  const categoriesById = new Map<string, PresentCategory>();

  skills.forEach((skill) => {
    if (!categoriesById.has(skill.categoryId)) {
      categoriesById.set(skill.categoryId, {
        id: skill.categoryId,
        name: skill.categoryName,
        index: skill.categoryIndex,
        colour: skill.colour,
      });
    }
  });

  return [...categoriesById.values()].sort(
    (categoryA, categoryB) => categoryA.index - categoryB.index
  );
};
