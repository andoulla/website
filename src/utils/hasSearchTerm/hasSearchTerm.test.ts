import { hasSearchTerm } from './hasSearchTerm';

describe('hasSearchTerm', () => {
  test('returns false when the term is undefined', () => {
    expect(hasSearchTerm(undefined)).toBe(false);
  });

  test('returns false when the term is an empty string', () => {
    expect(hasSearchTerm('')).toBe(false);
  });

  test('returns false when the term is only whitespace', () => {
    expect(hasSearchTerm('   ')).toBe(false);
  });

  test('returns true when a real term is provided', () => {
    expect(hasSearchTerm('react')).toBe(true);
  });

  test('returns false for a single-character term, below the minimum match length', () => {
    expect(hasSearchTerm('r')).toBe(false);
  });

  test('returns true for a two-character term', () => {
    expect(hasSearchTerm('js')).toBe(true);
  });
});
