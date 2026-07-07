import { skills as defaultSkills } from '@/data/skills';
import type { Skill } from '@/data/skills.types';
import { normaliseSearchTerm as normalise } from '@/utils/normaliseSearchTerm';

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
  const normalisedTerm = normalise(term);
  if (normalisedTerm === '') return null;

  const nameMatch = allSkills.find((skill) => normalise(skill.name) === normalisedTerm);
  if (nameMatch !== undefined) {
    return { skill: nameMatch, matchedOn: 'name', matchedTerm: nameMatch.name };
  }

  for (const skill of allSkills) {
    const matchedSynonym = skill.synonyms.find((synonym) => normalise(synonym) === normalisedTerm);
    if (matchedSynonym !== undefined) {
      return { skill, matchedOn: 'synonym', matchedTerm: matchedSynonym };
    }
  }

  return null;
};
