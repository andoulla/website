import { formatYears } from './formatYears';

describe('formatYears', () => {
  test('pluralises for zero years', () => {
    expect(formatYears(0)).toBe('0 years');
  });

  test('does not pluralise for exactly one year', () => {
    expect(formatYears(1)).toBe('1 year');
  });

  test('pluralises for more than one year', () => {
    expect(formatYears(4)).toBe('4 years');
  });
});
