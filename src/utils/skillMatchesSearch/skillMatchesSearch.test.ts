import { SkillSummary } from '@/testing';

import { skillMatchesSearch } from './skillMatchesSearch';

const REACT = new SkillSummary().skill('React').synonyms(['ReactJS', 'React.js']).mock();
const JAVASCRIPT = new SkillSummary().skill('JavaScript').synonyms(['JS', 'ECMAScript']).mock();

describe('skillMatchesSearch', () => {
  test('matches a substring of the canonical name', () => {
    expect(skillMatchesSearch(REACT, 'rea')).toBe(true);
  });

  test('matches a substring of a synonym', () => {
    expect(skillMatchesSearch(JAVASCRIPT, 'ecma')).toBe(true);
  });

  test('is case and punctuation insensitive', () => {
    expect(skillMatchesSearch(REACT, 'REACT.JS')).toBe(true);
  });

  test('returns false when nothing matches', () => {
    expect(skillMatchesSearch(REACT, 'rust')).toBe(false);
  });

  test('returns false for an empty or whitespace-only term', () => {
    expect(skillMatchesSearch(REACT, '')).toBe(false);
    expect(skillMatchesSearch(REACT, '   ')).toBe(false);
  });

  test('returns false for a single-character term, even if it would otherwise substring-match', () => {
    expect(skillMatchesSearch(REACT, 'r')).toBe(false);
  });

  test('matches a two-character term', () => {
    expect(skillMatchesSearch(JAVASCRIPT, 'js')).toBe(true);
  });
});
