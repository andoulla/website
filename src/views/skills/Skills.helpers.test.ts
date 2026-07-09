import {
  parseCategories,
  parseSearch,
  parseSubCategories,
  parseViewMode,
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
    const result = parseCategories('engineering,leadership-delivery');

    expect(result).toEqual(['engineering', 'leadership-delivery']);
  });

  test('drops unrecognised values', () => {
    const result = parseCategories('engineering,bogus');

    expect(result).toEqual(['engineering']);
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

  test('drops unrecognised values', () => {
    const result = parseSubCategories('testing,bogus');

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
    const params = new URLSearchParams('subCategory=testing&category=engineering');

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe('category=engineering&subCategory=testing');
  });

  test('puts view ahead of category and subCategory', () => {
    const params = new URLSearchParams('subCategory=testing&category=engineering&view=list');

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe('view=list&category=engineering&subCategory=testing');
  });

  test('leaves other params in place after view, category, and subCategory', () => {
    const params = new URLSearchParams('skill=React&subCategory=testing&category=engineering');

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe('category=engineering&subCategory=testing&skill=React');
  });

  test('omits view, category, or subCategory when not present', () => {
    const params = new URLSearchParams('skill=React&subCategory=testing');

    const result = reorderFilterParams(params);

    expect(result.toString()).toBe('subCategory=testing&skill=React');
  });
});
