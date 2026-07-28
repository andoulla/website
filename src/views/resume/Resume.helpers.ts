import type { TimelineEventWithRecommendations } from '@/types';
import { compareByRecency } from '@/utils/compareByRecency';

export const findMostRecentSkillMatchIndex = (
  events: TimelineEventWithRecommendations[],
  skillId: string
): number => {
  let bestIndex = -1;

  events.forEach((event, index) => {
    if (!event.skills.some((skill) => skill.id === skillId)) return;

    if (bestIndex === -1 || compareByRecency(event, events[bestIndex]) < 0) bestIndex = index;
  });

  return bestIndex;
};
