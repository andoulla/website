import type { TimelineEvent } from '@/types';

const RECENT_YEARS = 10;

// recent = ongoing, or ended within the last decade
export const isRecentEvent = (event: TimelineEvent, now: Date): boolean => {
  if (event.endDate === null) return true;
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - RECENT_YEARS);
  return new Date(event.endDate) >= cutoff;
};
