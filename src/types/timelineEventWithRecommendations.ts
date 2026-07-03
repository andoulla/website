import type { Recommendation } from './recommendation';
import type { TimelineEvent } from './timelineEvent';

export interface TimelineEventWithRecommendations extends TimelineEvent {
  recommendations: Recommendation[];
  techStack: string[];
  skills: string[];
}
