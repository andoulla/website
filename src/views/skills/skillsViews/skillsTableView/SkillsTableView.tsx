import { useEffect } from 'react';

import { hasSearchTerm } from '@/utils/hasSearchTerm';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';

import { useSkillsViewContext } from '../SkillsViewContext';

import { skillElementId } from './SkillsTableView.helpers';
import { SkillsTable } from './skillsTable';
import type { CategoryGroup } from './SkillsTableView.types';

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

  // Group by the active track's taxonomy; summaries keep their years-descending order.
  const categoryGroups: CategoryGroup[] = track.categories
    .map((category) => {
      const subGroups = category.subCategories
        .map((subCategory) => ({
          subCategory,
          skills: searchedSkills.filter((skill) => skill.subCategoryId === subCategory.id),
        }))
        .filter((group) => group.skills.length > 0);

      return {
        category,
        subGroups,
        skills: subGroups.flatMap((group) => group.skills),
      };
    })
    .filter((group) => group.skills.length > 0);

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
