import { SkillSummary } from '@/testing';

import { CATEGORY_PATTERN_ORDER } from './SkillsBarChart.constants';
import {
  getCategoryPatternBackground,
  getCategoryPatternId,
  getCategoryPatternType,
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

describe('getCategoryPatternType', () => {
  test('assigns patterns in fixed order by category index', () => {
    expect(getCategoryPatternType(0)).toBe('diagonal');
    expect(getCategoryPatternType(6)).toBe('rings');
  });

  test('cycles back to the first pattern past the end of the order', () => {
    expect(getCategoryPatternType(CATEGORY_PATTERN_ORDER.length)).toBe('diagonal');
  });
});

describe('getCategoryPatternId', () => {
  test('returns a stable id derived from the category id', () => {
    const result = getCategoryPatternId('frontend-development');

    expect(result).toBe('skill-bar-pattern-frontend-development');
  });

  test('returns a different id per category', () => {
    const frontend = getCategoryPatternId('frontend-development');
    const tooling = getCategoryPatternId('tooling');

    expect(frontend).not.toBe(tooling);
  });
});

describe('getCategoryPatternBackground', () => {
  test('returns a distinct background per category index for the same colours', () => {
    const backgrounds = new Set(
      CATEGORY_PATTERN_ORDER.map((_pattern, index) =>
        getCategoryPatternBackground(index, '#123456', '#ffffff')
      )
    );

    expect(backgrounds.size).toBe(CATEGORY_PATTERN_ORDER.length);
  });

  test('includes both the base colour and the mark colour', () => {
    const result = getCategoryPatternBackground(0, '#123456', '#abcdef');

    expect(result).toContain('#123456');
    expect(result).toContain('#abcdef');
  });
});
