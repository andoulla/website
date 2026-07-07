import { normaliseSearchTerm } from './normaliseSearchTerm';

describe('normaliseSearchTerm', () => {
  test('trims leading/trailing whitespace', () => {
    expect(normaliseSearchTerm('  React  ')).toBe('react');
  });

  test('lowercases the value', () => {
    expect(normaliseSearchTerm('TypeScript')).toBe('typescript');
  });

  test('strips punctuation and internal whitespace', () => {
    expect(normaliseSearchTerm('React.js')).toBe('reactjs');
    expect(normaliseSearchTerm('React JS')).toBe('reactjs');
  });

  test('returns an empty string for an empty or whitespace-only value', () => {
    expect(normaliseSearchTerm('')).toBe('');
    expect(normaliseSearchTerm('   ')).toBe('');
  });
});
