import { useMemo } from 'react';
import Alert from '@mui/material/Alert';

import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsBarChart } from './skillsBarChart';

export const SkillsGraphView = () => {
  const { skills, selectedCategories, selectedSubCategories, searchTerm } = useSkillsViewContext();

  const filteredSkills = useMemo(
    () =>
      filterSkillsByCategory(skills, selectedCategories, selectedSubCategories).sort((a, b) =>
        a.skill.localeCompare(b.skill)
      ),
    [skills, selectedCategories, selectedSubCategories]
  );

  if (skills.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

  return <SkillsBarChart skills={filteredSkills} searchTerm={searchTerm} />;
};
