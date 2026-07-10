import { normaliseSearchTerm } from '@/utils/normaliseSearchTerm';
import { MIN_SEARCH_TERM_LENGTH } from '@/utils/skillMatchesSearch';

export const hasSearchTerm = (searchTerm?: string): searchTerm is string =>
  searchTerm !== undefined && normaliseSearchTerm(searchTerm).length >= MIN_SEARCH_TERM_LENGTH;
