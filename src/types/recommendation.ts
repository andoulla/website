import type { TimelineEvent } from './timelineEvent';

export interface Recommendation {
  id: string;
  jobId: TimelineEvent['id'];
  authorInitials: string;
  authorRole: {
    jobTitle: string;
  };
  text: string;
  postedDate: string;
  recommendationUrl: string;
}
