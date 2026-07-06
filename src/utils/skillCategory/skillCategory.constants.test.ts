import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';

import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  SUBCATEGORIES_BY_CATEGORY,
  SUBCATEGORY_LABELS,
} from './skillCategory.constants';

const ALL_CATEGORIES: SkillCategory[] = ['engineering', 'managerial', 'soft-skills', 'other'];

const ALL_SUBCATEGORIES: SkillSubCategory[] = [
  'frontend-development',
  'testing',
  'styling',
  'design-system',
  'tooling',
  'collaboration-tools',
  'accessibility',
  'performance',
  'leadership',
  'delivery-planning',
  'stakeholder-management',
  'mentoring',
];

describe('skillCategory constants', () => {
  test('CATEGORY_ORDER contains every SkillCategory exactly once', () => {
    expect([...CATEGORY_ORDER].sort()).toEqual([...ALL_CATEGORIES].sort());
  });

  test('CATEGORY_LABELS has a label for every SkillCategory', () => {
    for (const category of ALL_CATEGORIES) {
      expect(CATEGORY_LABELS[category]).toEqual(expect.any(String));
    }
  });

  test('SUBCATEGORY_LABELS has a label for every SkillSubCategory', () => {
    for (const subCategory of ALL_SUBCATEGORIES) {
      expect(SUBCATEGORY_LABELS[subCategory]).toEqual(expect.any(String));
    }
  });

  test('SUBCATEGORIES_BY_CATEGORY covers every SkillSubCategory exactly once across all categories', () => {
    const covered = Object.values(SUBCATEGORIES_BY_CATEGORY).flat();

    expect([...covered].sort()).toEqual([...ALL_SUBCATEGORIES].sort());
  });

  test('SUBCATEGORIES_BY_CATEGORY has an entry for every SkillCategory', () => {
    for (const category of ALL_CATEGORIES) {
      expect(SUBCATEGORIES_BY_CATEGORY[category]).toEqual(expect.any(Array));
    }
  });
});
