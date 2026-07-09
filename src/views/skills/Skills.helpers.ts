import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import { isSkillCategory, isSkillSubCategory } from '@/utils/skillCategory';

import { CATEGORY_PARAM, SUBCATEGORY_PARAM } from './Skills.constants';

// Reads the comma-separated `category` URL param into a typed list, dropping unrecognised values.
export const parseCategories = (raw: string | null): SkillCategory[] =>
  raw !== null && raw.length > 0 ? raw.split(',').filter(isSkillCategory) : [];

// Reads the comma-separated `subCategory` URL param into a typed list, dropping unrecognised values.
export const parseSubCategories = (raw: string | null): SkillSubCategory[] =>
  raw !== null && raw.length > 0 ? raw.split(',').filter(isSkillSubCategory) : [];

// Reads the `search` URL param, defaulting to an empty string when absent.
export const parseSearch = (raw: string | null): string => raw ?? '';

// Keeps `category` ahead of `subCategory` in the URL regardless of which was set most recently.
export const reorderFilterParams = (params: URLSearchParams): URLSearchParams => {
  const ordered = new URLSearchParams();

  // Set category and subCategory first, in that fixed order, when present.
  for (const key of [CATEGORY_PARAM, SUBCATEGORY_PARAM]) {
    const value = params.get(key);
    if (value !== null) ordered.set(key, value);
  }

  // Carry over any other params (e.g. `skill`) after them, in their original order.
  for (const [key, value] of params) {
    if (key !== CATEGORY_PARAM && key !== SUBCATEGORY_PARAM) ordered.set(key, value);
  }

  return ordered;
};
