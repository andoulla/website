import { SkillSummary } from '@/testing';

import { aggregateSkillsByCategory } from './SkillsRadarChart.helpers';

describe('aggregateSkillsByCategory', () => {
  test('sums years and counts skills per category', () => {
    const skills = [
      new SkillSummary().skill('React').category('engineering').years(3).mock(),
      new SkillSummary().skill('TypeScript').category('engineering').years(2).mock(),
      new SkillSummary().skill('Team Leadership').category('managerial').years(1.5).mock(),
    ];

    const result = aggregateSkillsByCategory(['engineering', 'managerial'], skills);

    expect(result).toEqual([
      { category: 'engineering', label: 'Engineering', years: 5, skillCount: 2, isMatch: true },
      {
        category: 'managerial',
        label: 'Managerial',
        years: 1.5,
        skillCount: 1,
        isMatch: true,
      },
    ]);
  });

  test('includes a category with zero matching skills at 0 years', () => {
    const skills = [new SkillSummary().category('engineering').years(3).mock()];

    const result = aggregateSkillsByCategory(['engineering', 'other'], skills);

    expect(result).toContainEqual({
      category: 'other',
      label: 'Other',
      years: 0,
      skillCount: 0,
      isMatch: true,
    });
  });

  test('rounds summed years to 1 decimal place', () => {
    const skills = [
      new SkillSummary().category('engineering').years(1.11).mock(),
      new SkillSummary().skill('TypeScript').category('engineering').years(1.12).mock(),
    ];

    const result = aggregateSkillsByCategory(['engineering'], skills);

    expect(result[0].years).toBe(2.2);
  });

  test('marks isMatch true for every category when no search term is given', () => {
    const skills = [new SkillSummary().category('engineering').mock()];

    const result = aggregateSkillsByCategory(['engineering', 'other'], skills);

    expect(result.every((point) => point.isMatch)).toBe(true);
  });

  test('marks isMatch true only for categories with a matching skill', () => {
    const skills = [
      new SkillSummary().skill('React').category('engineering').mock(),
      new SkillSummary().skill('Team Leadership').category('managerial').mock(),
    ];

    const result = aggregateSkillsByCategory(['engineering', 'managerial'], skills, 'react');

    expect(result.find((point) => point.category === 'engineering')?.isMatch).toBe(true);
    expect(result.find((point) => point.category === 'managerial')?.isMatch).toBe(false);
  });

  test('marks isMatch false for a category with zero skills when a search term is active', () => {
    const skills = [new SkillSummary().category('engineering').mock()];

    const result = aggregateSkillsByCategory(['engineering', 'other'], skills, 'react');

    expect(result.find((point) => point.category === 'other')?.isMatch).toBe(false);
  });
});
