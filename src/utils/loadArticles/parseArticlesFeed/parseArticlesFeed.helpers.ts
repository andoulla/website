import type { RssFeedResponse } from './parseArticlesFeed.types';

// Never inserted into the live DOM and only .textContent is read, so scripts in the
// input never execute — this is a safe way to strip HTML down to plain text.
export const stripHtmlToText = (html: string): string =>
  new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';

export const extractImageUrl = (html: string): string | undefined => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const images = Array.from(doc.querySelectorAll('img'));
  const featuredImg = images.find((img) => {
    const width = img.getAttribute('width');
    const height = img.getAttribute('height');
    const src = img.getAttribute('src') ?? '';
    const isTrackingPixel = (width === '1' && height === '1') || src.includes('medium.com/_/stat');
    return !isTrackingPixel;
  });
  return featuredImg?.getAttribute('src') ?? undefined;
};

// Matches a leading YYYY-MM-DD, the ISO-date prefix RSS feeds use before the time/offset.
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
