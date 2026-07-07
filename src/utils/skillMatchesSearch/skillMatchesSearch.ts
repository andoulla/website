import type { SkillSummary } from '@/utils/calculateSkillYears';
import { normalizeSearchTerm } from '@/utils/normalizeSearchTerm';

const MIN_TERM_LENGTH = 2;

export const skillMatchesSearch = (skill: SkillSummary, term: string): boolean => {
  const normalizedTerm = normalizeSearchTerm(term);
  if (normalizedTerm.length < MIN_TERM_LENGTH) return false;

  if (normalizeSearchTerm(skill.skill).includes(normalizedTerm)) return true;

  return skill.synonyms.some((synonym) => normalizeSearchTerm(synonym).includes(normalizedTerm));
};
