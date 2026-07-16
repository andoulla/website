import type { TimelineEventWithRecommendations } from '@/types';

// Current job (endDate: null) outranks a past one; otherwise later startDate wins.
const isMoreRecent = (
  candidate: TimelineEventWithRecommendations,
  current: TimelineEventWithRecommendations
): boolean => {
  if (candidate.endDate === null && current.endDate !== null) return true;
  if (candidate.endDate !== null && current.endDate === null) return false;
  return candidate.startDate > current.startDate;
};

// Index of the most recent event containing the skill — a skill can span multiple jobs, and the
// most recent is the most relevant to scroll to. -1 when there's no match.
export const findMostRecentSkillMatchIndex = (
  events: TimelineEventWithRecommendations[],
  skillId: string
): number => {
  let bestIndex = -1;

  events.forEach((event, index) => {
    if (!event.skills.some((skill) => skill.id === skillId)) return;
    if (bestIndex === -1 || isMoreRecent(event, events[bestIndex])) bestIndex = index;
  });

  return bestIndex;
};
