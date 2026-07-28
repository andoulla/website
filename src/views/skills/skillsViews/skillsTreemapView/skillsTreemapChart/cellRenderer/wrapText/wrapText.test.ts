import { wrapText } from './wrapText';

describe('wrapText', () => {
  test('returns a single-element array when text fits within maxWidth', () => {
    expect(wrapText('React', 100)).toEqual(['React']);
  });

  test('wraps at a word boundary when text exceeds maxWidth', () => {
    // "TypeScript Testing" = 18 chars × 6.5 = 117px — exceeds 80px;
    // "TypeScript" alone = 10 × 6.5 = 65px — fits.
    expect(wrapText('TypeScript Testing', 80)).toEqual(['TypeScript', 'Testing']);
  });

  test('returns an empty array for an empty string', () => {
    expect(wrapText('', 100)).toEqual([]);
  });

  test('keeps a single long word on one line even when it exceeds maxWidth', () => {
    // A word wider than maxWidth cannot be split — it becomes its own line.
    expect(wrapText('Superlongwordthatexceedsmaxwidth', 10)).toEqual([
      'Superlongwordthatexceedsmaxwidth',
    ]);
  });

  test('produces one line per word when every pair exceeds maxWidth', () => {
    // Each word is ≤ 10 chars × 6.5 = 65px (fits within 70px);
    // any two words together exceed 70px, so each word becomes its own line.
    expect(wrapText('Leadership Delivery Planning', 70)).toEqual([
      'Leadership',
      'Delivery',
      'Planning',
    ]);
  });
});
