import type { Recommendation } from '@/types';

export const defaultRecommendation: Recommendation = {
  id: 'rec-1',
  jobId: 'job-1',
  authorInitials: 'J.D.',
  authorRole: { jobTitle: 'Manager' },
  text: 'Great work.',
  postedDate: '2021-01-01',
  recommendationUrl: 'https://www.linkedin.com/in/example/details/recommendations/',
};
