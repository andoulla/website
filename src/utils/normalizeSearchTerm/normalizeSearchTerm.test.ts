import { normalizeSearchTerm } from './normalizeSearchTerm';

describe('normalizeSearchTerm', () => {
  test('trims leading/trailing whitespace', () => {
    expect(normalizeSearchTerm('  React  ')).toBe('react');
  });

  test('lowercases the value', () => {
    expect(normalizeSearchTerm('TypeScript')).toBe('typescript');
  });

  test('strips punctuation and internal whitespace', () => {
    expect(normalizeSearchTerm('React.js')).toBe('reactjs');
    expect(normalizeSearchTerm('React JS')).toBe('reactjs');
  });

  test('returns an empty string for an empty or whitespace-only value', () => {
    expect(normalizeSearchTerm('')).toBe('');
    expect(normalizeSearchTerm('   ')).toBe('');
  });
});
