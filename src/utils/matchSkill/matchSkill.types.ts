import type { Skill } from '@/types';

export interface MatchSkillResult {
  skill: Skill;
  matchedOn: 'name' | 'synonym';
  matchedTerm: string;
}
