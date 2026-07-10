import type { SkillCategory } from '@/data/skills.types';
import { CATEGORY_ORDER } from '@/utils/skillCategory';

export const skillElementId = (name: string): string => `skill-${encodeURIComponent(name)}`;

export const createEmptyByCategory = <T>(): Record<SkillCategory, T[]> =>
  Object.fromEntries(CATEGORY_ORDER.map((category) => [category, [] as T[]])) as Record<
    SkillCategory,
    T[]
  >;
