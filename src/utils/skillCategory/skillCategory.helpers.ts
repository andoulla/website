import type { SkillCategory, SkillSubCategory } from '@/types';

import { CATEGORY_ORDER, SUBCATEGORY_LABELS } from './skillCategory.constants';

export const isSkillCategory = (value: string): value is SkillCategory =>
  (CATEGORY_ORDER as string[]).includes(value);

export const isSkillSubCategory = (value: string): value is SkillSubCategory =>
  Object.keys(SUBCATEGORY_LABELS).includes(value);

export const derivePresentCategories = <T extends { category: SkillCategory }>(
  items: T[]
): SkillCategory[] =>
  CATEGORY_ORDER.filter((category) => items.some((item) => item.category === category));
