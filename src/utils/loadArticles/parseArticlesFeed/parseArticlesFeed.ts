import type { Article } from '@/types';

import { isRssFeedResponse, stripHtmlToText } from './parseArticlesFeed.helpers';

export const parseArticlesFeed = (payload: unknown): Article[] => {
  if (!isRssFeedResponse(payload)) {
    throw new Error('Medium feed returned an error response');
  }

  return payload.items.map((item) => ({
    id: item.guid ?? item.link,
    title: item.title,
    link: item.link,
    publishedDate: item.pubDate.slice(0, 10),
    tags: item.categories ?? [],
    excerpt: item.description !== undefined ? stripHtmlToText(item.description) : '',
  }));
};
