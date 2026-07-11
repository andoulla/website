import { isRssFeedResponse, stripHtmlToText } from './parseArticlesFeed.helpers';

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

describe('isRssFeedResponse', () => {
  test('returns true for a valid feed response', () => {
    const payload = {
      status: 'ok',
      items: [{ link: 'https://example.com/post', title: 'Post', pubDate: '2026-01-01 00:00:00' }],
    };

    expect(isRssFeedResponse(payload)).toBe(true);
  });

  test('returns false when status is not "ok"', () => {
    expect(isRssFeedResponse({ status: 'error', items: [] })).toBe(false);
  });

  test('returns false when items is missing', () => {
    expect(isRssFeedResponse({ status: 'ok' })).toBe(false);
  });

  test('returns false when items is not an array', () => {
    expect(isRssFeedResponse({ status: 'ok', items: 'not-an-array' })).toBe(false);
  });

  test('returns false when an item is missing a required field', () => {
    const payload = { status: 'ok', items: [{ title: 'Post', pubDate: '2026-01-01 00:00:00' }] };

    expect(isRssFeedResponse(payload)).toBe(false);
  });

  test('returns false when pubDate is not ISO-date-prefixed', () => {
    const payload = {
      status: 'ok',
      items: [{ link: 'https://example.com/post', title: 'Post', pubDate: 'not-a-date' }],
    };

    expect(isRssFeedResponse(payload)).toBe(false);
  });
});
