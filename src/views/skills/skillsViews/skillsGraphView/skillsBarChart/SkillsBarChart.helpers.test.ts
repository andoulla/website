import { SkillSummary } from '@/testing';

import {
  getCategoryPatternBackground,
  getCategoryPatternId,
  isBarMatch,
} from './SkillsBarChart.helpers';

describe('isBarMatch', () => {
  test('returns true when no search term is provided', () => {
    const result = isBarMatch(new SkillSummary().skill('React').mock());

    expect(result).toBe(true);
  });

  test('returns true when the search term is empty', () => {
    const result = isBarMatch(new SkillSummary().skill('React').mock(), '');

    expect(result).toBe(true);
  });

  test('returns true when the search term is only whitespace', () => {
    const result = isBarMatch(new SkillSummary().skill('React').mock(), '   ');

    expect(result).toBe(true);
  });

  test('returns true when the skill matches the search term', () => {
    const result = isBarMatch(new SkillSummary().skill('React').mock(), 'rea');

    expect(result).toBe(true);
  });

  test('returns false when the skill does not match the search term', () => {
    const result = isBarMatch(new SkillSummary().skill('React').mock(), 'docker');

    expect(result).toBe(false);
  });

  test('returns true (not yet an active search) when the term is below the minimum match length', () => {
    const result = isBarMatch(new SkillSummary().skill('React').mock(), 'r');

    expect(result).toBe(true);
  });
});

describe('getCategoryPatternId', () => {
  test('returns a stable id derived from the category', () => {
    const result = getCategoryPatternId('engineering');

    expect(result).toBe('skill-bar-pattern-engineering');
  });

  test('returns a different id per category', () => {
    const engineering = getCategoryPatternId('engineering');
    const tooling = getCategoryPatternId('tooling');

    expect(engineering).not.toBe(tooling);
  });
});

describe('getCategoryPatternBackground', () => {
  test('returns a distinct background per category for the same colours', () => {
    const engineering = getCategoryPatternBackground('engineering', '#123456', '#ffffff');
    const qualityPerformance = getCategoryPatternBackground(
      'quality-performance',
      '#123456',
      '#ffffff'
    );
    const tooling = getCategoryPatternBackground('tooling', '#123456', '#ffffff');
    const leadershipDelivery = getCategoryPatternBackground(
      'leadership-delivery',
      '#123456',
      '#ffffff'
    );
    const peopleStakeholders = getCategoryPatternBackground(
      'people-stakeholders',
      '#123456',
      '#ffffff'
    );

    const backgrounds = new Set([
      engineering,
      qualityPerformance,
      tooling,
      leadershipDelivery,
      peopleStakeholders,
    ]);

    expect(backgrounds.size).toBe(5);
  });

  test('includes both the base colour and the mark colour', () => {
    const result = getCategoryPatternBackground('engineering', '#123456', '#abcdef');

    expect(result).toContain('#123456');
    expect(result).toContain('#abcdef');
  });
});
