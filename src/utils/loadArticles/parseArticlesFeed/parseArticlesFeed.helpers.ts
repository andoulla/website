import type { RssFeedResponse } from './parseArticlesFeed.types';

// Never inserted into the live DOM and only .textContent is read, so scripts in the
// input never execute — this is a safe way to strip HTML down to plain text.
export const stripHtmlToText = (html: string): string =>
  new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';

const PUB_DATE_PREFIX_PATTERN = /^\d{4}-\d{2}-\d{2}/;

const isRssFeedItemShape = (value: unknown): boolean =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).link === 'string' &&
  typeof (value as Record<string, unknown>).title === 'string' &&
  typeof (value as Record<string, unknown>).pubDate === 'string' &&
  PUB_DATE_PREFIX_PATTERN.test((value as Record<string, unknown>).pubDate as string);

export const isRssFeedResponse = (payload: unknown): payload is RssFeedResponse =>
  typeof payload === 'object' &&
  payload !== null &&
  (payload as Record<string, unknown>).status === 'ok' &&
  Array.isArray((payload as { items: unknown }).items) &&
  (payload as { items: unknown[] }).items.every(isRssFeedItemShape);
