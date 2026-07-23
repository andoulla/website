import type { TimelineEventWithRecommendations, Track } from '@/types';
import { trackSkillIds } from '@/utils/trackSkillIds';

// Events always kept; responsibilities/techStack/skills filtered to the track. Empty skillIds = universal.
export const filterEventsByTrack = (
  events: TimelineEventWithRecommendations[],
  track: Track
): TimelineEventWithRecommendations[] => {
  const skillIds = trackSkillIds(track);

  return events.map((event) => ({
    ...event,
    responsibilities: event.responsibilities.filter(
      (responsibility) =>
        responsibility.skillIds.length === 0 ||
        responsibility.skillIds.some((skillId) => skillIds.has(skillId))
    ),
    techStack: event.techStack.filter((skill) => skillIds.has(skill.id)),
    skills: event.skills.filter((skill) => skillIds.has(skill.id)),
  }));
};
