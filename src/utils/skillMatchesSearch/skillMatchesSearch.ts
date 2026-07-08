import type { SkillSummary } from '@/utils/calculateSkillYears';
import { normaliseSearchTerm } from '@/utils/normaliseSearchTerm';

const MIN_TERM_LENGTH = 2;

export const skillMatchesSearch = (skill: SkillSummary, term: string): boolean => {
  const normalisedTerm = normaliseSearchTerm(term);
  if (normalisedTerm.length < MIN_TERM_LENGTH) return false;

  if (normaliseSearchTerm(skill.skill).includes(normalisedTerm)) return true;

  return skill.synonyms.some((synonym) => normaliseSearchTerm(synonym).includes(normalisedTerm));
};

// True when there's no term to search by.
export const isSearchTermEmpty = (searchTerm?: string): boolean =>
  searchTerm === undefined || searchTerm.trim() === '';
