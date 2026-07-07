import { useMemo } from 'react';
import Alert from '@mui/material/Alert';

import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsBarChart } from './skillsBarChart';

export const SkillsGraphView = () => {
  const { skills, selectedCategories, selectedSubCategories } = useSkillsViewContext();

  const filteredSkills = useMemo(
    () =>
      filterSkillsByCategory(skills, selectedCategories, selectedSubCategories).sort(
        (a, b) => b.years - a.years
      ),
    [skills, selectedCategories, selectedSubCategories]
  );

  if (skills.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

  return <SkillsBarChart skills={filteredSkills} />;
};
