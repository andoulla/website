import {
  derivePresentCategories,
  isSkillCategory,
  isSkillSubCategory,
} from './skillCategory.helpers';

describe('isSkillCategory', () => {
  test('returns true for a known category', () => {
    expect(isSkillCategory('engineering')).toBe(true);
  });

  test('returns false for an unknown value', () => {
    expect(isSkillCategory('bogus')).toBe(false);
  });
});

describe('isSkillSubCategory', () => {
  test('returns true for a known subcategory', () => {
    expect(isSkillSubCategory('testing')).toBe(true);
  });

  test('returns false for an unknown value', () => {
    expect(isSkillSubCategory('bogus')).toBe(false);
  });
});

describe('derivePresentCategories', () => {
  test('returns only the categories present in the given items, in CATEGORY_ORDER', () => {
    const items = [{ category: 'tooling' as const }, { category: 'engineering' as const }];

    expect(derivePresentCategories(items)).toEqual(['engineering', 'tooling']);
  });

  test('returns an empty array when given no items', () => {
    expect(derivePresentCategories([])).toEqual([]);
  });
});
