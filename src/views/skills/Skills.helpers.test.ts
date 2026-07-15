import { Track } from '@/testing';

import {
  parseCategoryIds,
  parseSearch,
  parseSubCategoryIds,
  parseViewMode,
  reorderFilterParams,
} from './Skills.helpers';

const testTrack = new Track()
  .categories([
    {
      id: 'frontend-development',
      name: 'Frontend Development',
      subCategories: [
        { id: 'core-technologies', name: 'Core Technologies', skillIds: ['react'] },
        { id: 'testing', name: 'Testing', skillIds: [] },
      ],
    },
    {
      id: 'leadership',
      name: 'Leadership',
      subCategories: [{ id: 'people-management', name: 'People Management', skillIds: [] }],
    },
  ])
  .mock();

describe('parseCategoryIds', () => {
  test('returns an empty array when the param is null', () => {
    const result = parseCategoryIds(null, testTrack);

    expect(result).toEqual([]);
  });

  test('returns an empty array when the param is an empty string', () => {
    const result = parseCategoryIds('', testTrack);

    expect(result).toEqual([]);
  });

  test('splits a single category id', () => {
    const result = parseCategoryIds('frontend-development', testTrack);

    expect(result).toEqual(['frontend-development']);
  });

  test('splits multiple comma-separated category ids', () => {
    const result = parseCategoryIds('frontend-development,leadership', testTrack);

    expect(result).toEqual(['frontend-development', 'leadership']);
  });

  test('drops ids unknown to the active track', () => {
    const result = parseCategoryIds('frontend-development,bogus', testTrack);

    expect(result).toEqual(['frontend-development']);
  });
});

describe('parseSubCategoryIds', () => {
  test('returns an empty array when the param is null', () => {
    const result = parseSubCategoryIds(null, testTrack);

    expect(result).toEqual([]);
  });

  test('returns an empty array when the param is an empty string', () => {
    const result = parseSubCategoryIds('', testTrack);

    expect(result).toEqual([]);
  });

  test('splits a single subcategory id', () => {
    const result = parseSubCategoryIds('testing', testTrack);

    expect(result).toEqual(['testing']);
  });

  test('splits multiple comma-separated subcategory ids across categories', () => {
    const result = parseSubCategoryIds('testing,people-management', testTrack);

    expect(result).toEqual(['testing', 'people-management']);
  });

  test('drops ids unknown to the active track', () => {
    const result = parseSubCategoryIds('testing,bogus', testTrack);

    expect(result).toEqual(['testing']);
  });
});

describe('parseSearch', () => {
  test('returns an empty string when the param is null', () => {
    const result = parseSearch(null);

    expect(result).toBe('');
  });

  test('returns the raw value when present', () => {
    const result = parseSearch('react');

    expect(result).toBe('react');
  });
});

describe('parseViewMode', () => {
  test('returns null when the param is null', () => {
    expect(parseViewMode(null)).toBeNull();
  });

  test('returns null when the param is undefined', () => {
    expect(parseViewMode(undefined)).toBeNull();
  });

  test('returns null for an unrecognised value', () => {
    expect(parseViewMode('grid')).toBeNull();
  });

  test('returns each recognised view mode', () => {
    expect(parseViewMode('barchart')).toBe('barchart');
    expect(parseViewMode('radar')).toBe('radar');
    expect(parseViewMode('list')).toBe('list');
  });
});

describe('reorderFilterParams', () => {
  test('moves category ahead of subCategory when subCategory was set first', () => {
    const params = new URLSearchParams('subCategory=testing&category=frontend-development');

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe('category=frontend-development&subCategory=testing');
  });

  test('puts track ahead of view ahead of category and subCategory', () => {
    const params = new URLSearchParams(
      'subCategory=testing&category=frontend-development&view=list&track=full'
    );

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe(
      'track=full&view=list&category=frontend-development&subCategory=testing'
    );
  });

  test('leaves other params in place after the prefix params', () => {
    const params = new URLSearchParams(
      'skill=React&subCategory=testing&category=frontend-development'
    );

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe('category=frontend-development&subCategory=testing&skill=React');
  });

  test('omits track, view, category, or subCategory when not present', () => {
    const params = new URLSearchParams('skill=React&subCategory=testing');

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe('subCategory=testing&skill=React');
  });

  test('preserves repeated skill params instead of collapsing to the last one', () => {
    const params = new URLSearchParams(
      'skill=React&skill=TypeScript&category=frontend-development'
    );

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe('category=frontend-development&skill=React&skill=TypeScript');
  });
});
