import type { SkillCategory, SkillSubCategory } from '@/types';
import { isSkillCategory, isSkillSubCategory } from '@/utils/skillCategory';

import { CATEGORY_PARAM, SUBCATEGORY_PARAM, VIEW_MODES, VIEW_PARAM } from './Skills.constants';
import type { ViewMode } from './Skills.types';

// Reads the comma-separated `category` URL param into a typed list, dropping unrecognised values.
export const parseCategories = (raw: string | null): SkillCategory[] =>
  raw !== null && raw.length > 0 ? raw.split(',').filter(isSkillCategory) : [];

// Reads the comma-separated `subCategory` URL param into a typed list, dropping unrecognised values.
export const parseSubCategories = (raw: string | null): SkillSubCategory[] =>
  raw !== null && raw.length > 0 ? raw.split(',').filter(isSkillSubCategory) : [];

// Reads the `search` URL param, defaulting to an empty string when absent.
export const parseSearch = (raw: string | null): string => raw ?? '';

// Validates the raw `view` param against known ViewModes; null when absent or unrecognised.
export const parseViewMode = (raw: string | null | undefined): ViewMode | null =>
  VIEW_MODES.includes(raw as ViewMode) ? (raw as ViewMode) : null;

// Keeps `view` ahead of `category` ahead of `subCategory` in the URL, regardless of set order.
export const reorderFilterParams = (params: URLSearchParams): URLSearchParams => {
  const ordered = new URLSearchParams();

  // Set view, category, and subCategory first, in that fixed order, when present.
  for (const key of [VIEW_PARAM, CATEGORY_PARAM, SUBCATEGORY_PARAM]) {
    const value = params.get(key);
    if (value !== null) ordered.set(key, value);
  }

  // Carry over any other params (e.g. repeated `skill` params) after them, in their original
  // order — append, not set, so repeated same-key entries aren't collapsed to the last one.
  for (const [key, value] of params) {
    if (key !== VIEW_PARAM && key !== CATEGORY_PARAM && key !== SUBCATEGORY_PARAM) {
      ordered.append(key, value);
    }
  }

  return ordered;
};
