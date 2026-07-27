import { derivePresentCategories } from '@/utils/derivePresentCategories';
import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';
import { SkillsNoData } from '@/views/skills/skillsNoData';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsRadarChart } from './skillsRadarChart';

export const SkillsRadarView = () => {
  const { skills, filteredSkills, searchTerm, hasActiveFilters, onClearFilters } =
    useSkillsViewContext();

  if (skills.length === 0) {
    return <SkillsNoData />;
  }

  if (filteredSkills.length === 0) {
    return <SkillsEmptyState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />;
  }

  // Unfiltered skills keep the axis set stable across filters.
  const categories = derivePresentCategories(skills);

  return (
    <SkillsRadarChart skills={filteredSkills} categories={categories} searchTerm={searchTerm} />
  );
};
