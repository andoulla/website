import { skills as defaultSkills } from '@/data/skills';
import type { Skill } from '@/data/skills.types';

import type { MatchSkillResult } from './matchSkill.types';

const normalize = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/**
 * Authoring-time helper: looks up a raw tech/skill term (e.g. from a new job's
 * tech stack) against the canonical `name`/`synonyms` of every known skill, so
 * duplicate entries aren't created for a term that already exists under a
 * different spelling. Not used by any runtime UI code.
 */
export const matchSkill = (
  term: string,
  allSkills: Skill[] = defaultSkills
): MatchSkillResult | null => {
  const normalizedTerm = normalize(term);
  if (normalizedTerm === '') return null;

  const nameMatch = allSkills.find((skill) => normalize(skill.name) === normalizedTerm);
  if (nameMatch !== undefined) {
    return { skill: nameMatch, matchedOn: 'name', matchedTerm: nameMatch.name };
  }

  for (const skill of allSkills) {
    const synonym = skill.synonyms.find((s) => normalize(s) === normalizedTerm);
    if (synonym !== undefined) {
      return { skill, matchedOn: 'synonym', matchedTerm: synonym };
    }
  }

  return null;
};
