import type { ReactNode } from 'react';

import type { TimelineEventWithRecommendations } from '@/types';

export type ExperiencesPromise = Promise<TimelineEventWithRecommendations[]>;

export interface ResumeDataProviderProps {
  children: ReactNode;
  /** Overridable so tests can inject a fast, deterministic promise. */
  loader?: () => ExperiencesPromise;
}
