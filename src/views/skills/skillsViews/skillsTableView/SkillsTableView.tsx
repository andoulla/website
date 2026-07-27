import { useEffect } from 'react';

import { hasSearchTerm } from '@/utils/hasSearchTerm';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';

import { useSkillsViewContext } from '../SkillsViewContext';

import { groupSkillsByTrack, skillElementId } from './SkillsTableView.helpers';
import { SkillsTable } from './skillsTable';

export const SkillsTableView = () => {
  const {
    track,
    filteredSkills,
    highlightedSkills,
    searchTerm,
    selectedCategories,
    selectedSubCategories,
    onClearFilters,
  } = useSkillsViewContext();

  useEffect(() => {
    if (highlightedSkills.length === 0) return;

    const el = document.getElementById(skillElementId(highlightedSkills[0]));

    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedSkills]);

  // Hides non-matches rather than just accenting them.
  const searchedSkills = !hasSearchTerm(searchTerm)
    ? filteredSkills
    : filteredSkills.filter((skill) => skillMatchesSearch(skill, searchTerm));

  const categoryGroups = groupSkillsByTrack(track, searchedSkills);

  if (categoryGroups.length === 0) {
    return (
      <SkillsEmptyState
        hasActiveFilters={selectedCategories.length > 0 || selectedSubCategories.length > 0}
        onClearFilters={onClearFilters}
      />
    );
  }

  return <SkillsTable categoryGroups={categoryGroups} highlightedSkills={highlightedSkills} />;
};
