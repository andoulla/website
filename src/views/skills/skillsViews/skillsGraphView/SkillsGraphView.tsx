import { useMemo } from 'react';
import Alert from '@mui/material/Alert';

import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import { sortMatchesFirst } from '@/utils/sortMatchesFirst';
import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsBarChart } from './skillsBarChart';

export interface SkillsGraphViewProps {
  showPatterns?: boolean;
}

export const SkillsGraphView = ({ showPatterns = true }: SkillsGraphViewProps) => {
  const {
    skills,
    filteredSkills,
    searchTerm,
    selectedCategories,
    selectedSubCategories,
    highlightedSkills,
    onClearFilters,
  } = useSkillsViewContext();

  const sortedSkills = useMemo(() => {
    // Copy first — filteredSkills is shared via context, so sorting in place would mutate it.
    const alphabetical = [...filteredSkills].sort((a, b) => a.skill.localeCompare(b.skill));
    // Stable-sort matches to the top, keeping matches and non-matches alphabetical among themselves.
    const searchSorted = sortMatchesFirst(alphabetical, (skill) =>
      skillMatchesSearch(skill, searchTerm)
    );
    // Float a highlighted skill (arrived at via a Resume deep link) above everything else.
    return sortMatchesFirst(searchSorted, (skill) => highlightedSkills.includes(skill.skill));
  }, [filteredSkills, searchTerm, highlightedSkills]);

  if (skills.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

  if (sortedSkills.length === 0) {
    return (
      <SkillsEmptyState
        hasActiveFilters={selectedCategories.length > 0 || selectedSubCategories.length > 0}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <SkillsBarChart
      skills={sortedSkills}
      searchTerm={searchTerm}
      showPatterns={showPatterns}
      highlightedSkills={highlightedSkills}
    />
  );
};
