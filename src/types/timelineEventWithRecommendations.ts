import type { Recommendation } from './recommendation';
import type { Skill } from './skill';
import type { TimelineEvent } from './timelineEvent';

export interface TimelineEventWithRecommendations extends TimelineEvent {
  recommendations: Recommendation[];
  techStack: Skill[];
  skills: Skill[];
}
