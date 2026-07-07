import type { TimelineEventWithRecommendations } from '@/types';

import { joinJobsWithRecommendations } from './joinJobsWithRecommendations';

// Dynamic import() code-splits the data so it isn't pulled in at module load.
export const loadExperiences = async (): Promise<TimelineEventWithRecommendations[]> => {
  const [{ jobs }, { recommendations }, { skills }] = await Promise.all([
    import('@/data/jobs'),
    import('@/data/recommendations'),
    import('@/data/skills'),
  ]);

  return joinJobsWithRecommendations(jobs, recommendations, skills);
};
