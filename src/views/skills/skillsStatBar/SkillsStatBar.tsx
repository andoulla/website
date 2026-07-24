import Stack from '@mui/material/Stack';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import { deriveSkillTypeSplit } from '@/utils/deriveSkillTypeSplit';

import { RecommendationStat } from './recommendationStat';
import { SkillTypeMeter } from './skillTypeMeter';

export interface SkillsStatBarProps {
  skills: SkillSummary[];
  filteredSkills: SkillSummary[];
}

export const SkillsStatBar = ({ skills, filteredSkills }: SkillsStatBarProps) => {
  const recCount = skills.filter((skill) => skill.recommendationIds.length > 0).length;
  const split = deriveSkillTypeSplit(filteredSkills);

  if (recCount === 0 && split.techCount + split.skillCount === 0) return null;

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
      <RecommendationStat count={recCount} />
      <SkillTypeMeter split={split} />
    </Stack>
  );
};
