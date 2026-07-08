import type { SkillSummary } from '@/utils/calculateSkillYears';
import { isSearchTermEmpty } from '@/utils/isSearchTermEmpty';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

// Whether a bar should render at full opacity: no active search, or this skill matches it.
export const isBarMatch = (skill: SkillSummary, searchTerm?: string): boolean =>
  isSearchTermEmpty(searchTerm) ||
  (searchTerm !== undefined && skillMatchesSearch(skill, searchTerm));
