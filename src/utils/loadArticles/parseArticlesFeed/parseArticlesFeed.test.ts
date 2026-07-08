import { parseArticlesFeed } from './parseArticlesFeed';

describe('parseArticlesFeed', () => {
  test('maps a valid rss2json response into Article objects', () => {
    const payload = {
      status: 'ok',
      items: [
        {
          guid: 'guid-1',
          link: 'https://medium.com/@user/post-1',
          title: 'Post One',
          pubDate: '2026-06-16 09:00:00',
          categories: ['engineering', 'career'],
          description: '<p>A short <em>excerpt</em>.</p>',
        },
      ],
    };

    expect(parseArticlesFeed(payload)).toEqual([
      {
        id: 'guid-1',
        title: 'Post One',
        link: 'https://medium.com/@user/post-1',
        publishedDate: '2026-06-16',
        tags: ['engineering', 'career'],
        excerpt: 'A short excerpt.',
      },
    ]);
  });

  test('falls back to link for id when guid is missing', () => {
    const payload = {
      status: 'ok',
      items: [
        {
          link: 'https://medium.com/@user/post-2',
          title: 'Post Two',
          pubDate: '2026-03-18 12:00:00',
        },
      ],
    };

    expect(parseArticlesFeed(payload)[0].id).toBe('https://medium.com/@user/post-2');
  });

  test('defaults tags and excerpt when categories/description are absent', () => {
    const payload = {
      status: 'ok',
      items: [
        {
          link: 'https://medium.com/@user/post-3',
          title: 'Post Three',
          pubDate: '2026-03-18 12:00:00',
        },
      ],
    };

    const [article] = parseArticlesFeed(payload);

    expect(article.tags).toEqual([]);
    expect(article.excerpt).toBe('');
  });

  test('throws when the response status is not ok', () => {
    const payload = { status: 'error', items: [] };

    expect(() => parseArticlesFeed(payload)).toThrow('Medium feed returned an error response');
  });
});
