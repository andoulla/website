import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';
import { SkillsNoData } from '@/views/skills/skillsNoData';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsTreemapChart } from './skillsTreemapChart';

export const SkillsTreemapView = () => {
  const { skills, filteredSkills, selectedCategories, selectedSubCategories, onClearFilters } =
    useSkillsViewContext();

  if (skills.length === 0) {
    return <SkillsNoData />;
  }

  if (filteredSkills.length === 0) {
    return (
      <SkillsEmptyState
        hasActiveFilters={selectedCategories.length > 0 || selectedSubCategories.length > 0}
        onClearFilters={onClearFilters}
      />
    );
  }

  return <SkillsTreemapChart skills={filteredSkills} />;
};
