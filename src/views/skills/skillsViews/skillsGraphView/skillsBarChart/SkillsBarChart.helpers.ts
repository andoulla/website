import type { SkillSummary } from '@/utils/calculateSkillYears';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

// Whether a bar should render at full opacity: no active search, or this skill matches it.
export const isBarMatch = (skill: SkillSummary, searchTerm?: string): boolean =>
  searchTerm === undefined || searchTerm.trim() === '' || skillMatchesSearch(skill, searchTerm);
