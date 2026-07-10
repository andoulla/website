import { formatDate } from './formatDate';

describe('formatDate', () => {
  test('formats an ISO date as day, short month, and year', () => {
    expect(formatDate('2026-05-18')).toBe('18 May 2026');
  });

  test('does not zero-pad the day', () => {
    expect(formatDate('2022-01-05')).toBe('5 Jan 2022');
  });

  test('returns an empty string for a null date', () => {
    expect(formatDate(null)).toBe('');
  });

  test('returns an empty string for an undefined date', () => {
    expect(formatDate(undefined)).toBe('');
  });

  test('returns an empty string for a malformed date string', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  test('returns an empty string for an out-of-range month', () => {
    expect(formatDate('2026-13-01')).toBe('');
  });

  test('returns an empty string for a day that overflows its month', () => {
    expect(formatDate('2024-02-30')).toBe('');
  });

  test('returns an empty string for a 31st in a 30-day month', () => {
    expect(formatDate('2024-04-31')).toBe('');
  });

  test('formats a leap-year 29 February', () => {
    expect(formatDate('2024-02-29')).toBe('29 Feb 2024');
  });

  test('returns an empty string for 29 February in a non-leap year', () => {
    expect(formatDate('2023-02-29')).toBe('');
  });
});
