import Alert from '@mui/material/Alert';

import { CATEGORY_ORDER } from '@/utils/skillCategory';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsRadarChart } from './skillsRadarChart';

export const SkillsRadarView = () => {
  const { skills, filteredSkills, searchTerm } = useSkillsViewContext();

  if (skills.length === 0) {
    return <Alert severity="info">No skill data available.</Alert>;
  }

  // Unfiltered skills keep the axis set stable across filters.
  const categories = CATEGORY_ORDER.filter((category) =>
    skills.some((skill) => skill.category === category)
  );

  return (
    <SkillsRadarChart skills={filteredSkills} categories={categories} searchTerm={searchTerm} />
  );
};
