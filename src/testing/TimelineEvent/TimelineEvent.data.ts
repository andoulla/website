import type { TimelineEventWithRecommendations } from '@/types';

export const defaultTimelineEvent: TimelineEventWithRecommendations = {
  id: 'job-1',
  type: 'work',
  companyName: 'Acme Corp',
  location: 'Remote',
  startDate: '2020-01-01',
  endDate: null,
  responsibilities: [],
  logo: '',
  experienceUrl: 'https://www.linkedin.com/in/example/details/experience/',
  recommendations: [],
  techStack: [],
  skills: [],
};
