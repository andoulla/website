import type { SkillCategory } from '@/types';
import { CATEGORY_ORDER } from '@/utils/skillCategory';

export const skillElementId = (name: string): string => `skill-${encodeURIComponent(name)}`;

// Seeds a reduce accumulator with every category pre-populated as an empty array, so the
// resulting object's key order always matches CATEGORY_ORDER instead of skill-encounter order.
export const createEmptyByCategory = <T>(): Record<SkillCategory, T[]> =>
  Object.fromEntries(CATEGORY_ORDER.map((category) => [category, [] as T[]])) as Record<
    SkillCategory,
    T[]
  >;
