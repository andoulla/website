import { useMemo } from 'react';
import Alert from '@mui/material/Alert';

import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import { sortMatchesFirst } from '@/utils/sortMatchesFirst';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsBarChart } from './skillsBarChart';

export interface SkillsGraphViewProps {
  showPatterns?: boolean;
}

export const SkillsGraphView = ({ showPatterns = true }: SkillsGraphViewProps) => {
  const { skills, selectedCategories, selectedSubCategories, searchTerm } = useSkillsViewContext();

  const filteredSkills = useMemo(() => {
    const alphabetical = filterSkillsByCategory(
      skills,
      selectedCategories,
      selectedSubCategories
    ).sort((a, b) => a.skill.localeCompare(b.skill));
    // Stable-sorted on top of the alphabetical order above, so matches float to the top while
    // staying alphabetical among themselves (and so do the remaining non-matches).
    return sortMatchesFirst(alphabetical, (skill) => skillMatchesSearch(skill, searchTerm));
  }, [skills, selectedCategories, selectedSubCategories, searchTerm]);

  if (skills.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

  return (
    <SkillsBarChart skills={filteredSkills} searchTerm={searchTerm} showPatterns={showPatterns} />
  );
};
