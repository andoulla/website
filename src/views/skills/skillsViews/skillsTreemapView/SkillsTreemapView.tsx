import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';
import { SkillsNoData } from '@/views/skills/skillsNoData';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsTreemapChart } from './skillsTreemapChart';

const TreemapSkeleton = () => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gridTemplateRows: 'auto auto',
      gap: 1,
      p: 1,
    }}
  >
    <Skeleton variant="rectangular" height={120} />
    <Skeleton variant="rectangular" height={120} sx={{ gridRow: 'span 2' }} />
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
      <Skeleton variant="rectangular" height={80} />
      <Skeleton variant="rectangular" height={80} />
    </Box>
  </Box>
);

export const SkillsTreemapView = () => {
  const { skills, filteredSkills, showPatterns, onClearFilters } = useSkillsViewContext();

  if (skills.length === 0) {
    return <SkillsNoData />;
  }

  if (filteredSkills.length === 0) {
    return (
      <SkillsEmptyState onClearFilters={onClearFilters}>
        <TreemapSkeleton />
      </SkillsEmptyState>
    );
  }

  return <SkillsTreemapChart skills={filteredSkills} showPatterns={showPatterns} />;
};
