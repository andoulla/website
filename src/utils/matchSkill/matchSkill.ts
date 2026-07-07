import { skills as defaultSkills } from '@/data/skills';
import type { Skill } from '@/data/skills.types';
import { normalizeSearchTerm as normalize } from '@/utils/normalizeSearchTerm';

import type { MatchSkillResult } from './matchSkill.types';

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
    const matchedSynonym = skill.synonyms.find((synonym) => normalize(synonym) === normalizedTerm);
    if (matchedSynonym !== undefined) {
      return { skill, matchedOn: 'synonym', matchedTerm: matchedSynonym };
    }
  }

  return null;
};
