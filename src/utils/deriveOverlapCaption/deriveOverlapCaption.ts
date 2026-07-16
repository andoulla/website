import type { TimelineEventWithRecommendations } from '@/types';

const rangesOverlap = (
  event: TimelineEventWithRecommendations,
  other: TimelineEventWithRecommendations,
  today: Date
): boolean => {
  const eventEnd = event.endDate !== null ? new Date(event.endDate) : today;
  const otherEnd = other.endDate !== null ? new Date(other.endDate) : today;
  return new Date(event.startDate) <= otherEnd && new Date(other.startDate) <= eventEnd;
};

// A fresh Date() per call — callers in a render path should memoize alongside their own deps.
export const deriveOverlapCaption = (
  event: TimelineEventWithRecommendations,
  allEvents: TimelineEventWithRecommendations[],
  today: Date = new Date()
): string | undefined => {
  if (event.type !== 'internship') return undefined;

  const overlapping = allEvents.filter(
    (other) =>
      other.id !== event.id && other.type !== 'internship' && rangesOverlap(event, other, today)
  );

  if (overlapping.length === 0) return undefined;

  return `Alongside ${overlapping.map((other) => other.companyName).join(', ')}`;
};
