import { SkillSummary } from '@/testing';
import type { SkillSummary as SkillSummaryData } from '@/utils/calculateSkillYears';

import { filterSkillsByCategory } from './filterSkillsByCategory';

const SKILLS: SkillSummaryData[] = [
  new SkillSummary()
    .skill('React')
    .category('engineering')
    .subCategory('frontend-development')
    .mock(),
  new SkillSummary().skill('Jest').category('quality-performance').subCategory('testing').mock(),
  new SkillSummary()
    .skill('Team Leadership')
    .category('leadership-delivery')
    .subCategory('leadership')
    .mock(),
];

describe('filterSkillsByCategory', () => {
  test('returns all skills when no filters are selected', () => {
    const result = filterSkillsByCategory(SKILLS, [], []);

    expect(result).toEqual(SKILLS);
  });

  test('filters by category only', () => {
    const result = filterSkillsByCategory(SKILLS, ['leadership-delivery'], []);

    expect(result.map((s) => s.skill)).toEqual(['Team Leadership']);
  });

  test('filters by subcategory only', () => {
    const result = filterSkillsByCategory(SKILLS, [], ['testing']);

    expect(result.map((s) => s.skill)).toEqual(['Jest']);
  });

  test('filters by category and subcategory combined using AND semantics', () => {
    const result = filterSkillsByCategory(SKILLS, ['quality-performance'], ['testing']);

    expect(result.map((s) => s.skill)).toEqual(['Jest']);
  });

  test('returns an empty array when nothing matches', () => {
    const result = filterSkillsByCategory(SKILLS, ['leadership-delivery'], ['testing']);

    expect(result).toEqual([]);
  });
});
