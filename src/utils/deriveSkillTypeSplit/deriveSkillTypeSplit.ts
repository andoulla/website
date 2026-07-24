import type { SkillSummary } from '@/utils/calculateSkillYears';

import type { SkillTypeSplit } from './deriveSkillTypeSplit.types';

export const deriveSkillTypeSplit = (skills: SkillSummary[]): SkillTypeSplit => {
  const techCount = skills.filter((skill) => skill.type === 'tech').length;
  const skillCount = skills.filter((skill) => skill.type === 'skill').length;
  const total = techCount + skillCount;
  const techPct = total === 0 ? 0 : Math.round((techCount / total) * 1000) / 10;

  return { techCount, skillCount, techPct };
};
