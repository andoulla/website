import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

import { derivePresentCategories } from '@/utils/derivePresentCategories';
import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';
import { SkillsNoData } from '@/views/skills/skillsNoData';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsRadarChart } from './skillsRadarChart';

const RadarSkeleton = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
    <Skeleton variant="circular" width={280} height={280} />
  </Box>
);

export const SkillsRadarView = () => {
  const { skills, filteredSkills, searchTerm, onClearFilters } = useSkillsViewContext();

  if (skills.length === 0) {
    return <SkillsNoData />;
  }

  if (filteredSkills.length === 0) {
    return (
      <SkillsEmptyState onClearFilters={onClearFilters}>
        <RadarSkeleton />
      </SkillsEmptyState>
    );
  }

  // Unfiltered skills keep the axis set stable across filters.
  const categories = derivePresentCategories(skills);

  return (
    <SkillsRadarChart skills={filteredSkills} categories={categories} searchTerm={searchTerm} />
  );
};
