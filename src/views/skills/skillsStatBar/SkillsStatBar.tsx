import Stack from '@mui/material/Stack';

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
    <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
      <RecommendationStat count={recommendationCount} />
      <SkillTypeMeter split={split} />
    </Stack>
  );
};
