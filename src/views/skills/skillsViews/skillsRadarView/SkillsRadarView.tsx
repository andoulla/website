import Alert from '@mui/material/Alert';

import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';

import { useSkillsViewContext } from '../SkillsViewContext';

export const SkillsRadarView = () => {
  const { skills, selectedCategories, selectedSubCategories } = useSkillsViewContext();
  const filteredSkills = filterSkillsByCategory(skills, selectedCategories, selectedSubCategories);

  return (
    <Alert severity="info">{`Radar view coming soon (${filteredSkills.length} skills).`}</Alert>
  );
};
