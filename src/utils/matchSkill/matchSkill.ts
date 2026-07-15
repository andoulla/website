import { skills as defaultSkills } from '@/data/skills';
import type { Skill } from '@/types';
import { normaliseSearchTerm as normalise } from '@/utils/normaliseSearchTerm';

import type { MatchSkillResult } from './matchSkill.types';

// Resolves a raw term (?skill= param, tech-stack entry) against every skill's
// name/synonyms — old display names keep deep-linking after renames.
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
