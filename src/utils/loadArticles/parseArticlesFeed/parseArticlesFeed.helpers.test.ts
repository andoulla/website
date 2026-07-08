import { stripHtmlToText } from './parseArticlesFeed.helpers';

describe('stripHtmlToText', () => {
  test('strips HTML tags and returns plain text', () => {
    expect(stripHtmlToText('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  test('returns an empty string for an empty input', () => {
    expect(stripHtmlToText('')).toBe('');
  });

  test('never executes a script tag in the input, only reads it as inert text', () => {
    const withScript = '<p>Safe</p><script>window.__pwned = true;</script>';
    const result = stripHtmlToText(withScript);

    expect(result).not.toContain('<script>');
    expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
  });
});
