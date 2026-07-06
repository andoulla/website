import { formatDate } from './formatDate';

describe('formatDate', () => {
  test('formats an ISO date as day, short month, and year', () => {
    expect(formatDate('2026-05-18')).toBe('18 May 2026');
  });

  test('does not zero-pad the day', () => {
    expect(formatDate('2022-01-05')).toBe('5 Jan 2022');
  });
});
