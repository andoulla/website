import { SkillSummary } from '@/testing';

import { isBarMatch } from './SkillsBarChart.helpers';

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

  test('returns false when the search term is below the minimum match length', () => {
    const result = isBarMatch(new SkillSummary().skill('React').mock(), 'r');

    expect(result).toBe(false);
  });
});
