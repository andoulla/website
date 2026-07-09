import { useMemo } from 'react';
import Alert from '@mui/material/Alert';

import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import { sortMatchesFirst } from '@/utils/sortMatchesFirst';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsBarChart } from './skillsBarChart';

export interface SkillsGraphViewProps {
  showPatterns?: boolean;
}

export const SkillsGraphView = ({ showPatterns = true }: SkillsGraphViewProps) => {
  const { skills, filteredSkills, searchTerm } = useSkillsViewContext();

  const sortedSkills = useMemo(() => {
    // Copy first — filteredSkills is shared via context, so sorting in place would mutate it.
    const alphabetical = [...filteredSkills].sort((a, b) => a.skill.localeCompare(b.skill));
    // Stable-sort matches to the top, keeping matches and non-matches alphabetical among themselves.
    return sortMatchesFirst(alphabetical, (skill) => skillMatchesSearch(skill, searchTerm));
  }, [filteredSkills, searchTerm]);

  if (skills.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

  return (
    <SkillsBarChart skills={sortedSkills} searchTerm={searchTerm} showPatterns={showPatterns} />
  );
};
