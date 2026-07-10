import type { SkillCategory } from '@/data/skills.types';
import { CATEGORY_ORDER } from '@/utils/skillCategory';

export const skillElementId = (name: string): string => `skill-${encodeURIComponent(name)}`;
// TODO: add comment here to explain the shape it produces and why we have this
export const createEmptyByCategory = <T>(): Record<SkillCategory, T[]> =>
  Object.fromEntries(CATEGORY_ORDER.map((category) => [category, [] as T[]])) as Record<
    SkillCategory,
    T[]
  >;
