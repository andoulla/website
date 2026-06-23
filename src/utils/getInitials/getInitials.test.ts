import { getInitials } from './getInitials';

describe('getInitials', () => {
  test('returns the first letter of the first two name parts, uppercased', () => {
    expect(getInitials('Priya Shah')).toBe('PS');
  });

  test('caps at two initials for longer names', () => {
    expect(getInitials('Ada Beatrice King')).toBe('AB');
  });

  test('handles a single name', () => {
    expect(getInitials('Madonna')).toBe('M');
  });
});
