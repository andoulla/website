import { loadArticles, resetArticlesCache } from './loadArticles';

const okResponse = (body: unknown): Response =>
  ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  }) as Response;

describe('loadArticles', () => {
  beforeEach(() => {
    resetArticlesCache();
    jest.spyOn(global, 'fetch').mockReset();
  });

  test('fetches the medium feed via rss2json and returns parsed articles', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      okResponse({
        status: 'ok',
        items: [
          {
            guid: 'guid-1',
            link: 'https://medium.com/@mariandi-stylianou/post-1',
            title: 'Post One',
            pubDate: '2026-06-16 09:00:00',
            categories: ['career'],
            description: '<p>Excerpt</p>',
          },
        ],
      })
    );

    const articles = await loadArticles();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.rss2json.com/v1/api.json?rss_url=' +
        encodeURIComponent('https://medium.com/feed/@mariandi-stylianou')
    );
    expect(articles).toEqual([
      {
        id: 'guid-1',
        title: 'Post One',
        link: 'https://medium.com/@mariandi-stylianou/post-1',
        publishedDate: '2026-06-16',
        tags: ['career'],
        excerpt: 'Excerpt',
        imageUrl: undefined,
      },
    ]);
  });

  test('rejects when the HTTP response is not ok', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 503 } as Response);

    await expect(loadArticles()).rejects.toThrow('Failed to load articles: 503');
  });

  test('rejects when rss2json returns an error status in the body', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(okResponse({ status: 'error', items: [] }));

    await expect(loadArticles()).rejects.toThrow('Medium feed returned an error response');
  });

  test('reuses the cached promise on a second call instead of re-fetching', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(okResponse({ status: 'ok', items: [] }));

    await loadArticles();
    await loadArticles();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('retries on the next call instead of replaying a cached rejection', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    fetchSpy.mockResolvedValueOnce({ ok: false, status: 503 } as Response);

    await expect(loadArticles()).rejects.toThrow('Failed to load articles: 503');

    fetchSpy.mockResolvedValueOnce(okResponse({ status: 'ok', items: [] }));

    await expect(loadArticles()).resolves.toEqual([]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
