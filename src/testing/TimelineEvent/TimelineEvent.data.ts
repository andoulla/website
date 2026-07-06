import type { TimelineEventWithRecommendations } from '@/types';

export const defaultTimelineEvent: TimelineEventWithRecommendations = {
  id: 'job-1',
  type: 'work',
  companyName: 'Acme Corp',
  title: 'Software Engineer',
  location: 'Remote',
  startDate: '2020-01-01',
  endDate: null,
  responsibilities: [],
  recommendations: [],
  techStack: [],
  skills: [],
};
