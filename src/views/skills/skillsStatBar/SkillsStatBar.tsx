import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import { deriveSkillTypeSplit } from '@/utils/deriveSkillTypeSplit';

import { RecommendationStat } from './recommendationStat';
import { SkillTypeMeter } from './skillTypeMeter';

export interface SkillsStatBarProps {
  filteredSkills: SkillSummary[];
}

export const SkillsStatBar = ({ filteredSkills }: SkillsStatBarProps) => {
  const recommendationCount = filteredSkills.filter(
    (skill) => skill.recommendationIds.length > 0
  ).length;
  const split = deriveSkillTypeSplit(filteredSkills);

  if (recommendationCount === 0 && split.techCount + split.skillCount === 0) return null;

  return (
    <Stack direction="row" spacing={2} sx={{ mt: 0, mb: { xs: 1.5, sm: 2 }, alignItems: 'center' }}>
      <Typography variant="body1" color="text.secondary">
        At a glance
      </Typography>
      <RecommendationStat count={recommendationCount} />
      <SkillTypeMeter split={split} />
    </Stack>
  );
};
