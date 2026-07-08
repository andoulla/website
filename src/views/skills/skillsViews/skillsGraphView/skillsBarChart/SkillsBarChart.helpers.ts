import type { SkillSummary } from '@/utils/calculateSkillYears';
import { hasSearchTerm } from '@/utils/hasSearchTerm';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

// Whether a bar should render at full opacity: no active search, or this skill matches it.
export const isBarMatch = (skill: SkillSummary, searchTerm?: string): boolean =>
  !hasSearchTerm(searchTerm) || skillMatchesSearch(skill, searchTerm);
