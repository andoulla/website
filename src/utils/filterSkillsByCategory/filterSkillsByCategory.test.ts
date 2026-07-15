import { SkillSummary } from '@/testing';
import type { SkillSummary as SkillSummaryData } from '@/utils/calculateSkillYears';

import { filterSkillsByCategory } from './filterSkillsByCategory';

const SKILLS: SkillSummaryData[] = [
  new SkillSummary()
    .skill('React')
    .categoryId('frontend-development')
    .subCategoryId('core-technologies')
    .mock(),
  new SkillSummary().skill('Jest').categoryId('quality').subCategoryId('testing').mock(),
  new SkillSummary()
    .skill('Team Leadership')
    .categoryId('leadership')
    .subCategoryId('people-management')
    .mock(),
];

describe('filterSkillsByCategory', () => {
  test('returns all skills when no filters are selected', () => {
    const result = filterSkillsByCategory(SKILLS, [], []);

    expect(result).toEqual(SKILLS);
  });

  test('filters by category only', () => {
    const result = filterSkillsByCategory(SKILLS, ['leadership'], []);

    expect(result.map((skill) => skill.skill)).toEqual(['Team Leadership']);
  });

  test('filters by subcategory only', () => {
    const result = filterSkillsByCategory(SKILLS, [], ['testing']);

    expect(result.map((skill) => skill.skill)).toEqual(['Jest']);
  });

  test('filters by category and subcategory combined using AND semantics', () => {
    const result = filterSkillsByCategory(SKILLS, ['quality'], ['testing']);

    expect(result.map((skill) => skill.skill)).toEqual(['Jest']);
  });

  test('returns an empty array when nothing matches', () => {
    const result = filterSkillsByCategory(SKILLS, ['leadership'], ['testing']);

    expect(result).toEqual([]);
  });
});
