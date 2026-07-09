import type { ReactNode } from 'react';

import type { TimelineEventWithRecommendations } from '@/types';

export type CareerHistoryPromise = Promise<TimelineEventWithRecommendations[]>;

export interface CareerDataContextProviderProps {
  children: ReactNode;
  /** Overridable so tests can inject a fast, deterministic promise. */
  loader?: () => CareerHistoryPromise;
}
