import { TRACK_PARAM } from '@/context/track';
import type { Track } from '@/types';
import { CATEGORY_PARAM, SUBCATEGORY_PARAM, VIEW_MODES, VIEW_PARAM } from '@/utils/skillsUrlParams';

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

const PREFIX_PARAMS = [TRACK_PARAM, VIEW_PARAM, CATEGORY_PARAM, SUBCATEGORY_PARAM];

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
