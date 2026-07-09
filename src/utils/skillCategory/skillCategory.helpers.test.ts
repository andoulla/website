import { isSkillCategory, isSkillSubCategory } from './skillCategory.helpers';

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
