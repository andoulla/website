import { TRACK_PARAM } from '@/context/track';
import type { TimelineEventWithRecommendations } from '@/types';
import { normaliseSearchTerm } from '@/utils/normaliseSearchTerm';
import { MIN_SEARCH_TERM_LENGTH } from '@/utils/skillMatchesSearch';

import { FOCUS_PARAM, RECOMMENDATION_PARAM, SKILL_PARAM } from '../Resume.constants';

import type { SearchResult } from './ExperienceSearch.types';

// Current job (endDate null) first, then later start date first.
const byRecency = (
  first: TimelineEventWithRecommendations,
  second: TimelineEventWithRecommendations
): number => {
  if (first.endDate === null && second.endDate !== null) return -1;
  if (first.endDate !== null && second.endDate === null) return 1;
  return second.startDate.localeCompare(first.startDate);
};

// Tech and skills are split across two fields by type; search both.
const skillEntriesOf = (event: TimelineEventWithRecommendations) => [
  ...event.techStack,
  ...event.skills,
];

// Skills → Roles → Recommendations, contiguous so Autocomplete's groupBy renders clean groups.
export const buildSearchResults = (events: TimelineEventWithRecommendations[]): SearchResult[] => {
  const skillResults: SearchResult[] = [...events].sort(byRecency).flatMap((event) =>
    skillEntriesOf(event).map((skill) => ({
      kind: 'skill' as const,
      id: `skill:${skill.id}:${event.id}`,
      skillId: skill.id,
      skillName: skill.name,
      event,
    }))
  );

  const roleResults: SearchResult[] = events.map((event) => ({
    kind: 'role',
    id: `role:${event.id}`,
    event,
  }));

  const recommendationResults: SearchResult[] = events.flatMap((event) =>
    event.recommendations.map((recommendation) => ({
      kind: 'recommendation' as const,
      id: `rec:${recommendation.id}`,
      recommendation,
      event,
    }))
  );

  return [...skillResults, ...roleResults, ...recommendationResults];
};

const searchableText = (result: SearchResult): string[] => {
  switch (result.kind) {
    case 'skill': {
      const skill = skillEntriesOf(result.event).find((entry) => entry.id === result.skillId);
      return [result.skillName, ...(skill?.synonyms ?? [])];
    }
    case 'role':
      // Bullet text too — a responsibility hit surfaces its role card.
      return [
        result.event.companyName,
        result.event.title,
        ...result.event.responsibilities.map((responsibility) => responsibility.text),
      ];
    case 'recommendation':
      return [
        result.recommendation.authorRole.jobTitle,
        result.recommendation.text,
        result.recommendation.authorInitials,
      ];
  }
};

export const matchesQuery = (result: SearchResult, query: string): boolean => {
  const normalisedQuery = normaliseSearchTerm(query);
  if (normalisedQuery.length < MIN_SEARCH_TERM_LENGTH) return false;

  // Substring match, so partial terms (e.g. "jav" → JavaScript) hit.
  return searchableText(result).some((text) => normaliseSearchTerm(text).includes(normalisedQuery));
};

// Fresh query (track + one param) so no stale skill/focus stacks up.
export const resultTo = (result: SearchResult, trackId: string): string => {
  const params = new URLSearchParams();
  params.set(TRACK_PARAM, trackId);

  switch (result.kind) {
    case 'skill':
      params.set(SKILL_PARAM, result.skillName);
      params.set(FOCUS_PARAM, result.event.id);
      break;
    case 'role':
      params.set(FOCUS_PARAM, result.event.id);
      break;
    case 'recommendation':
      params.set(RECOMMENDATION_PARAM, result.recommendation.id);
      break;
  }

  return `/?${params.toString()}`;
};

const formatYearRange = (event: TimelineEventWithRecommendations): string => {
  const startYear = event.startDate.slice(0, 4);
  const endYear = event.endDate === null ? 'Present' : event.endDate.slice(0, 4);
  return `${startYear}–${endYear}`;
};

export const optionLabel = (result: SearchResult): string => {
  switch (result.kind) {
    case 'skill':
      return `${result.skillName} · ${result.event.companyName} · ${formatYearRange(result.event)}`;
    case 'role':
      return result.event.companyName;
    case 'recommendation':
      return `${result.recommendation.authorInitials} · ${result.recommendation.authorRole.jobTitle}`;
  }
};

export const groupLabel = (kind: SearchResult['kind']): 'Skills' | 'Roles' | 'Recommendations' => {
  switch (kind) {
    case 'skill':
      return 'Skills';
    case 'role':
      return 'Roles';
    case 'recommendation':
      return 'Recommendations';
  }
};
