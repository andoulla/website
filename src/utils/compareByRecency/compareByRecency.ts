import type { TimelineEventWithRecommendations } from '@/types';

// Null endDate = current job, sorts first; otherwise later startDate wins.
export const compareByRecency = (
  a: TimelineEventWithRecommendations,
  b: TimelineEventWithRecommendations
): number => {
  if (a.endDate === null && b.endDate !== null) return -1;

  if (a.endDate !== null && b.endDate === null) return 1;

  return b.startDate.localeCompare(a.startDate);
};
