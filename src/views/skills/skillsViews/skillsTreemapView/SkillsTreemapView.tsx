import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';
import { SkillsNoData } from '@/views/skills/skillsNoData';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsTreemapChart } from './skillsTreemapChart';

export const SkillsTreemapView = () => {
  const { skills, filteredSkills, hasActiveFilters, showPatterns, onClearFilters } =
    useSkillsViewContext();

  if (skills.length === 0) {
    return <SkillsNoData />;
  }

  if (filteredSkills.length === 0) {
    return <SkillsEmptyState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />;
  }

  return <SkillsTreemapChart skills={filteredSkills} showPatterns={showPatterns} />;
};
