import { isSearchTermEmpty } from './isSearchTermEmpty';

describe('isSearchTermEmpty', () => {
  test('returns true when the term is undefined', () => {
    expect(isSearchTermEmpty(undefined)).toBe(true);
  });

  test('returns true when the term is an empty string', () => {
    expect(isSearchTermEmpty('')).toBe(true);
  });

  test('returns true when the term is only whitespace', () => {
    expect(isSearchTermEmpty('   ')).toBe(true);
  });

  test('returns false when a real term is provided', () => {
    expect(isSearchTermEmpty('react')).toBe(false);
  });
});
