import type { TimelineEventWithRecommendations } from '@/types';

import { joinCareerHistoryWithRecommendations } from './joinCareerHistoryWithRecommendations';

// Dynamic import() code-splits the data so it isn't pulled in at module load.
export const loadCareerHistory = async (): Promise<TimelineEventWithRecommendations[]> => {
  const [{ careerHistory }, { recommendations }, { skills }] = await Promise.all([
    import('@/data/careerHistory'),
    import('@/data/recommendations'),
    import('@/data/skills'),
  ]);

  return joinCareerHistoryWithRecommendations(careerHistory, recommendations, skills);
};
