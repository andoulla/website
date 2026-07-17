import { createTheme } from '@mui/material/styles';

import { SkillSummary } from '@/testing';
import type { PresentCategory } from '@/utils/derivePresentCategories';

import {
  aggregateSkillsByCategory,
  formatAxisTick,
  resolveDotColour,
} from './SkillsRadarChart.helpers';
import type { CategoryRadarPoint } from './SkillsRadarChart.types';

const frontendCategory: PresentCategory = {
  id: 'frontend-development',
  name: 'Frontend Development',
  index: 0,
  colour: 'teal',
};

const leadershipCategory: PresentCategory = {
  id: 'leadership',
  name: 'Leadership',
  index: 1,
  colour: 'green',
};

const leadershipSkill = () =>
  new SkillSummary()
    .id('team-leadership')
    .skill('Team Leadership')
    .categoryId('leadership')
    .categoryName('Leadership')
    .categoryIndex(1)
    .colour('green');

describe('aggregateSkillsByCategory', () => {
  test('averages years and counts skills per category', () => {
    const skills = [
      new SkillSummary().skill('React').years(3).mock(),
      new SkillSummary().id('typescript').skill('TypeScript').years(2).mock(),
      leadershipSkill().years(1.5).mock(),
    ];

    const result = aggregateSkillsByCategory([frontendCategory, leadershipCategory], skills);

    expect(result).toEqual([
      {
        categoryId: 'frontend-development',
        categoryIndex: 0,
        label: 'Frontend Development',
        avgYears: 2.5,
        skillCount: 2,
        isMatch: true,
      },
      {
        categoryId: 'leadership',
        categoryIndex: 1,
        label: 'Leadership',
        avgYears: 1.5,
        skillCount: 1,
        isMatch: true,
      },
    ]);
  });

  test('includes a category with zero matching skills at 0 years', () => {
    const skills = [new SkillSummary().years(3).mock()];

    const result = aggregateSkillsByCategory([frontendCategory, leadershipCategory], skills);

    expect(result).toContainEqual({
      categoryId: 'leadership',
      categoryIndex: 1,
      label: 'Leadership',
      avgYears: 0,
      skillCount: 0,
      isMatch: true,
    });
  });

  test('rounds averaged years to 1 decimal place', () => {
    const skills = [
      new SkillSummary().years(1.11).mock(),
      new SkillSummary().id('typescript').skill('TypeScript').years(1.12).mock(),
    ];

    const result = aggregateSkillsByCategory([frontendCategory], skills);

    expect(result[0].avgYears).toBe(1.1);
  });

  test('marks isMatch true for every category when no search term is given', () => {
    const skills = [new SkillSummary().mock()];

    const result = aggregateSkillsByCategory([frontendCategory, leadershipCategory], skills);

    expect(result.every((point) => point.isMatch)).toBe(true);
  });

  test('marks isMatch true only for categories with a matching skill', () => {
    const skills = [new SkillSummary().skill('React').mock(), leadershipSkill().mock()];

    const result = aggregateSkillsByCategory(
      [frontendCategory, leadershipCategory],
      skills,
      'react'
    );

    expect(result.find((point) => point.categoryId === 'frontend-development')?.isMatch).toBe(true);
    expect(result.find((point) => point.categoryId === 'leadership')?.isMatch).toBe(false);
  });

  test('marks isMatch false for a category with zero skills when a search term is active', () => {
    const skills = [new SkillSummary().mock()];

    const result = aggregateSkillsByCategory(
      [frontendCategory, leadershipCategory],
      skills,
      'react'
    );

    expect(result.find((point) => point.categoryId === 'leadership')?.isMatch).toBe(false);
  });
});

describe('resolveDotColour', () => {
  const frontendPoint: CategoryRadarPoint = {
    categoryId: 'frontend-development',
    categoryIndex: 0,
    label: 'Frontend Development',
    avgYears: 2.5,
    skillCount: 2,
    isMatch: true,
  };

  test('returns the category colour for a matching point', () => {
    const theme = createTheme();

    expect(resolveDotColour(frontendPoint, theme)).toBe('#00897B');
  });

  test('returns the disabled colour for a non-matching point', () => {
    const theme = createTheme();

    expect(resolveDotColour({ ...frontendPoint, isMatch: false }, theme)).toBe(
      theme.palette.action.disabled
    );
  });
});

describe('formatAxisTick', () => {
  test('suffixes the tick value with y', () => {
    expect(formatAxisTick(5)).toBe('5y');
  });
});
