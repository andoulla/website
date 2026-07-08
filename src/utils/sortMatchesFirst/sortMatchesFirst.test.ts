import { sortMatchesFirst } from './sortMatchesFirst';

describe('sortMatchesFirst', () => {
  test('moves matches ahead of non-matches', () => {
    const result = sortMatchesFirst([1, 2, 3, 4], (item) => item === 3);

    expect(result).toEqual([3, 1, 2, 4]);
  });

  test('preserves relative order within the matching group', () => {
    const result = sortMatchesFirst([1, 2, 3, 4], (item) => item === 2 || item === 4);

    expect(result).toEqual([2, 4, 1, 3]);
  });

  test('preserves relative order within the non-matching group', () => {
    const result = sortMatchesFirst([1, 2, 3, 4], (item) => item === 1);

    expect(result).toEqual([1, 2, 3, 4]);
  });

  test('leaves order unchanged when nothing matches', () => {
    const result = sortMatchesFirst([1, 2, 3], () => false);

    expect(result).toEqual([1, 2, 3]);
  });

  test('leaves order unchanged when everything matches', () => {
    const result = sortMatchesFirst([1, 2, 3], () => true);

    expect(result).toEqual([1, 2, 3]);
  });

  test('does not mutate the input array', () => {
    const input = [1, 2, 3];

    sortMatchesFirst(input, (item) => item === 3);

    expect(input).toEqual([1, 2, 3]);
  });
});
