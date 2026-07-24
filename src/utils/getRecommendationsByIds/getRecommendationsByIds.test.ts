import { Recommendation } from '@/testing';

import { getRecommendationsByIds } from './getRecommendationsByIds';

describe('getRecommendationsByIds', () => {
  test('returns recommendations in the order of ids', () => {
    const recA = new Recommendation().id('a').text('First.').mock();
    const recB = new Recommendation().id('b').text('Second.').mock();
    const recC = new Recommendation().id('c').text('Third.').mock();

    const result = getRecommendationsByIds(['c', 'a'], [recA, recB, recC]);

    expect(result).toEqual([recC, recA]);
  });

  test('silently drops ids not found in the recommendations list', () => {
    const recA = new Recommendation().id('a').text('Exists.').mock();

    const result = getRecommendationsByIds(['a', 'missing-id'], [recA]);

    expect(result).toEqual([recA]);
  });

  test('returns an empty array when ids is empty', () => {
    const recA = new Recommendation().id('a').mock();

    const result = getRecommendationsByIds([], [recA]);

    expect(result).toEqual([]);
  });
});
