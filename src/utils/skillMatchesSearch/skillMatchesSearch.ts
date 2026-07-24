import type { SkillSummary } from '@/utils/calculateSkillYears';
import { normaliseSearchTerm } from '@/utils/normaliseSearchTerm';

export const MIN_SEARCH_TERM_LENGTH = 2;

export const skillMatchesSearch = (skill: SkillSummary, term: string): boolean => {
  const normalisedTerm = normaliseSearchTerm(term);

  if (normalisedTerm.length < MIN_SEARCH_TERM_LENGTH) return false;

  if (normaliseSearchTerm(skill.skill).includes(normalisedTerm)) return true;

  return skill.synonyms.some((synonym) => normaliseSearchTerm(synonym).includes(normalisedTerm));
};
