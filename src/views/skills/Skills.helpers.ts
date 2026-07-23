import { TRACK_PARAM } from '@/context/track';
import type { TimelineEventWithRecommendations, Track } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import {
  AS_OF_PARAM,
  CATEGORY_PARAM,
  SUBCATEGORY_PARAM,
  VIEW_MODES,
  VIEW_PARAM,
} from '@/utils/skillsUrlParams';

import type { ViewMode } from './Skills.types';

// Reads the comma-separated `category` URL param, dropping ids unknown to the active track —
// stale ids from another track self-clean on switch.
export const parseCategoryIds = (raw: string | null, track: Track): string[] => {
  if (raw === null || raw.length === 0) return [];
  const knownIds = new Set(track.categories.map((category) => category.id));
  return raw.split(',').filter((id) => knownIds.has(id));
};

// Reads the comma-separated `subCategory` URL param, dropping ids unknown to the active track.
export const parseSubCategoryIds = (raw: string | null, track: Track): string[] => {
  if (raw === null || raw.length === 0) return [];
  const knownIds = new Set(
    track.categories.flatMap((category) =>
      category.subCategories.map((subCategory) => subCategory.id)
    )
  );
  return raw.split(',').filter((id) => knownIds.has(id));
};

// Reads the `search` URL param, defaulting to an empty string when absent.
export const parseSearch = (raw: string | null): string => raw ?? '';

// Validates the raw `view` param against known ViewModes; null when absent or unrecognised.
export const parseViewMode = (raw: string | null | undefined): ViewMode | null =>
  VIEW_MODES.includes(raw as ViewMode) ? (raw as ViewMode) : null;

// Reads the `asOf` year param, clamped into [minYear, maxYear]; defaults to maxYear ("latest").
export const parseAsOfYear = (raw: string | null, minYear: number, maxYear: number): number => {
  if (raw === null) return maxYear;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return maxYear;
  return Math.min(Math.max(parsed, minYear), maxYear);
};

// Drops recommendation links that postdate the asOf cutoff.
export const scopeRecommendationsAsOf = (
  skills: SkillSummary[],
  careerHistory: TimelineEventWithRecommendations[],
  asOfDate: Date
): SkillSummary[] => {
  const validRecommendationIds = new Set(
    careerHistory
      .flatMap((event) => event.recommendations)
      .filter((recommendation) => new Date(recommendation.postedDate) <= asOfDate)
      .map((recommendation) => recommendation.id)
  );

  return skills.map((skill) => ({
    ...skill,
    recommendationIds: skill.recommendationIds.filter((id) => validRecommendationIds.has(id)),
  }));
};

const PREFIX_PARAMS = [TRACK_PARAM, VIEW_PARAM, CATEGORY_PARAM, SUBCATEGORY_PARAM, AS_OF_PARAM];

// Keeps `track` ahead of `view` ahead of `category` ahead of `subCategory` in the URL,
// regardless of set order.
export const reorderFilterParams = (params: URLSearchParams): URLSearchParams => {
  const ordered = new URLSearchParams();

  // Set the prefix params first, in their fixed order, when present.
  for (const key of PREFIX_PARAMS) {
    const value = params.get(key);
    if (value !== null) ordered.set(key, value);
  }

  // Carry over any other params (e.g. repeated `skill` params) after them, in their original
  // order — append, not set, so repeated same-key entries aren't collapsed to the last one.
  for (const [key, value] of params) {
    if (!PREFIX_PARAMS.includes(key)) {
      ordered.append(key, value);
    }
  }

  return ordered;
};
