import type { Article } from '@/types';

import { stripHtmlToText } from './parseArticlesFeed.helpers';
import type { RssFeedResponse } from './parseArticlesFeed.types';

export const parseArticlesFeed = (payload: unknown): Article[] => {
  const response = payload as RssFeedResponse;

  if (response === null || typeof response !== 'object' || response.status !== 'ok') {
    throw new Error('Medium feed returned an error response');
  }

  return response.items.map((item) => ({
    id: item.guid ?? item.link,
    title: item.title,
    link: item.link,
    publishedDate: item.pubDate.slice(0, 10),
    tags: item.categories ?? [],
    excerpt: item.description !== undefined ? stripHtmlToText(item.description) : '',
  }));
};
