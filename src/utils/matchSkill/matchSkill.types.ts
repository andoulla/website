import type { Skill } from '@/data/skills.types';

export interface MatchSkillResult {
  skill: Skill;
  matchedOn: 'name' | 'synonym';
  matchedTerm: string;
}
