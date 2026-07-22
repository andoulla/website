import type { Recommendation, TimelineEventWithRecommendations } from '@/types';

// One row per (skill, job), one per role, one per recommendation. id is unique per row.
export type SearchResult =
  | {
      kind: 'skill';
      id: string;
      skillId: string;
      skillName: string;
      event: TimelineEventWithRecommendations;
    }
  | { kind: 'role'; id: string; event: TimelineEventWithRecommendations }
  | {
      kind: 'recommendation';
      id: string;
      recommendation: Recommendation;
      event: TimelineEventWithRecommendations;
    };
