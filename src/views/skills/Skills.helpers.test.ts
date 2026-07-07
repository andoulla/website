import {
  parseCategories,
  parseSearch,
  parseSubCategories,
  reorderFilterParams,
} from './Skills.helpers';

describe('parseCategories', () => {
  test('returns an empty array when the param is null', () => {
    const result = parseCategories(null);

    expect(result).toEqual([]);
  });

  test('returns an empty array when the param is an empty string', () => {
    const result = parseCategories('');

    expect(result).toEqual([]);
  });

  test('splits a single category', () => {
    const result = parseCategories('engineering');

    expect(result).toEqual(['engineering']);
  });

  test('splits multiple comma-separated categories', () => {
    const result = parseCategories('engineering,managerial');

    expect(result).toEqual(['engineering', 'managerial']);
  });
});

describe('parseSubCategories', () => {
  test('returns an empty array when the param is null', () => {
    const result = parseSubCategories(null);

    expect(result).toEqual([]);
  });

  test('returns an empty array when the param is an empty string', () => {
    const result = parseSubCategories('');

    expect(result).toEqual([]);
  });

  test('splits a single subcategory', () => {
    const result = parseSubCategories('testing');

    expect(result).toEqual(['testing']);
  });

  test('splits multiple comma-separated subcategories', () => {
    const result = parseSubCategories('testing,leadership');

    expect(result).toEqual(['testing', 'leadership']);
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

describe('reorderFilterParams', () => {
  test('moves category ahead of subCategory when subCategory was set first', () => {
    const params = new URLSearchParams('subCategory=testing&category=engineering');

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe('category=engineering&subCategory=testing');
  });

  test('leaves other params in place after category and subCategory', () => {
    const params = new URLSearchParams('skill=React&subCategory=testing&category=engineering');

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe('category=engineering&subCategory=testing&skill=React');
  });

  test('omits category or subCategory when not present', () => {
    const params = new URLSearchParams('skill=React&subCategory=testing');

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe('subCategory=testing&skill=React');
  });
});
