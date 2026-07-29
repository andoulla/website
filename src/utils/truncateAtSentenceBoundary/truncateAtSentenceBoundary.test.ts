import { truncateAtSentenceBoundary } from './truncateAtSentenceBoundary';

describe('truncateAtSentenceBoundary', () => {
  test('returns text as-is if it is shorter than max length', () => {
    const text = 'This is a short sentence.';

    const result = truncateAtSentenceBoundary(text, 100);

    expect(result).toBe(text);
  });

  test('truncates at the nearest sentence boundary (period + space)', () => {
    const text = 'First sentence. Second sentence that is quite long. Third sentence.';

    const result = truncateAtSentenceBoundary(text, 40);

    // When truncating at a sentence boundary, no ellipsis is needed
    expect(result).toBe('First sentence.');
  });

  test('truncates at a question mark boundary', () => {
    const text = 'What is this? This is another sentence.';

    const result = truncateAtSentenceBoundary(text, 20);

    // When truncating at a sentence boundary, no ellipsis is needed
    expect(result).toBe('What is this?');
  });

  test('truncates at an exclamation mark boundary', () => {
    const text = 'This is exciting! This is the next sentence that follows.';

    const result = truncateAtSentenceBoundary(text, 30);

    // When truncating at a sentence boundary, no ellipsis is needed
    expect(result).toBe('This is exciting!');
  });

  test('respects clause boundaries (comma + space within a sentence)', () => {
    const text = 'This has a clause, which continues, but is still one sentence. Next sentence.';

    const result = truncateAtSentenceBoundary(text, 50);

    // Should truncate at a comma boundary and include ellipsis
    expect(result.includes(',')).toBe(true);
    expect(result.includes('…')).toBe(true);
  });

  test('falls back to max length if no boundary is found within reasonable range', () => {
    const text = 'Verylongwordwithoutanyspacesorpunctuation';

    const result = truncateAtSentenceBoundary(text, 20);

    expect(result.length).toBeLessThanOrEqual(20);
  });

  test('adds ellipsis when text is truncated at a non-sentence boundary', () => {
    const text = 'This is a very long sentence that keeps going without ending properly';

    const result = truncateAtSentenceBoundary(text, 30);

    expect(result).toContain('…');
  });

  test('does not add ellipsis if text ends with punctuation and is not truncated', () => {
    const text = 'First sentence. Second sentence.';

    const result = truncateAtSentenceBoundary(text, 100);

    expect(result).toBe(text);
  });

  test('handles edge case of very short max length', () => {
    const text = 'This is a test.';

    const result = truncateAtSentenceBoundary(text, 5);

    expect(result.length).toBeLessThanOrEqual(5);
  });
});
