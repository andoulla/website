import { contact } from '@/data/contact';
import type { Article } from '@/types';

import { parseArticlesFeed } from './parseArticlesFeed';

const RSS2JSON_ENDPOINT = 'https://api.rss2json.com/v1/api.json';

let cachedArticles: Promise<Article[]> | null = null;

const fetchAndParseArticles = async (): Promise<Article[]> => {
  const feedUrl = contact.medium.replace('https://medium.com/', 'https://medium.com/feed/');
  const response = await fetch(`${RSS2JSON_ENDPOINT}?rss_url=${encodeURIComponent(feedUrl)}`);

  if (!response.ok) {
    throw new Error(`Failed to load articles: ${response.status}`);
  }

  const payload: unknown = await response.json();

  return parseArticlesFeed(payload);
};

// Cached at module scope so revisiting /articles in the same session doesn't re-hit
// rss2json's rate-limited free tier.
export const loadArticles = (): Promise<Article[]> => {
  cachedArticles ??= fetchAndParseArticles().catch((error: unknown) => {
    cachedArticles = null;
    throw error;
  });
  return cachedArticles;
};

// Test-only escape hatch to reset the module-level cache between test cases.
export const resetArticlesCache = (): void => {
  cachedArticles = null;
};
