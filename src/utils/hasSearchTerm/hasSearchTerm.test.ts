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
});
