import { SkillSummary } from '@/testing';

import { aggregateSkillsByCategory } from './SkillsRadarChart.helpers';

describe('aggregateSkillsByCategory', () => {
  test('averages years and counts skills per category', () => {
    const skills = [
      new SkillSummary().skill('React').category('engineering').years(3).mock(),
      new SkillSummary().skill('TypeScript').category('engineering').years(2).mock(),
      new SkillSummary().skill('Team Leadership').category('leadership-delivery').years(1.5).mock(),
    ];

    const result = aggregateSkillsByCategory(['engineering', 'leadership-delivery'], skills);

    expect(result).toEqual([
      {
        category: 'engineering',
        label: 'Engineering',
        avgYears: 2.5,
        skillCount: 2,
        isMatch: true,
      },
      {
        category: 'leadership-delivery',
        label: 'Leadership & Delivery',
        avgYears: 1.5,
        skillCount: 1,
        isMatch: true,
      },
    ]);
  });

  test('includes a category with zero matching skills at 0 years', () => {
    const skills = [new SkillSummary().category('engineering').years(3).mock()];

    const result = aggregateSkillsByCategory(['engineering', 'quality-performance'], skills);

    expect(result).toContainEqual({
      category: 'quality-performance',
      label: 'Quality & Performance',
      avgYears: 0,
      skillCount: 0,
      isMatch: true,
    });
  });

  test('rounds averaged years to 1 decimal place', () => {
    const skills = [
      new SkillSummary().category('engineering').years(1.11).mock(),
      new SkillSummary().skill('TypeScript').category('engineering').years(1.12).mock(),
    ];

    const result = aggregateSkillsByCategory(['engineering'], skills);

    expect(result[0].avgYears).toBe(1.1);
  });

  test('marks isMatch true for every category when no search term is given', () => {
    const skills = [new SkillSummary().category('engineering').mock()];

    const result = aggregateSkillsByCategory(['engineering', 'quality-performance'], skills);

    expect(result.every((point) => point.isMatch)).toBe(true);
  });

  test('marks isMatch true only for categories with a matching skill', () => {
    const skills = [
      new SkillSummary().skill('React').category('engineering').mock(),
      new SkillSummary().skill('Team Leadership').category('leadership-delivery').mock(),
    ];

    const result = aggregateSkillsByCategory(
      ['engineering', 'leadership-delivery'],
      skills,
      'react'
    );

    expect(result.find((point) => point.category === 'engineering')?.isMatch).toBe(true);
    expect(result.find((point) => point.category === 'leadership-delivery')?.isMatch).toBe(false);
  });

  test('marks isMatch false for a category with zero skills when a search term is active', () => {
    const skills = [new SkillSummary().category('engineering').mock()];

    const result = aggregateSkillsByCategory(
      ['engineering', 'quality-performance'],
      skills,
      'react'
    );

    expect(result.find((point) => point.category === 'quality-performance')?.isMatch).toBe(false);
  });
});
