import { recommendations as defaultRecommendations } from '@/data/recommendations';
import type { Recommendation } from '@/types';

export const getRecommendationsByIds = (
  ids: string[],
  recommendations: Recommendation[] = defaultRecommendations
): Recommendation[] =>
  ids
    .map((id) => recommendations.find((rec) => rec.id === id))
    .filter((rec): rec is Recommendation => rec !== undefined);
