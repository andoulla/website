import type { TimelineEventWithRecommendations, Track } from '@/types';

// Events always kept; responsibilities/techStack/skills filtered to the track. Empty skillIds = universal.
export const filterEventsByTrack = (
  events: TimelineEventWithRecommendations[],
  track: Track
): TimelineEventWithRecommendations[] => {
  const trackSkillIds = new Set(
    track.categories.flatMap((category) =>
      category.subCategories.flatMap((subCategory) => subCategory.skillIds)
    )
  );

  return events.map((event) => ({
    ...event,
    responsibilities: event.responsibilities.filter(
      (responsibility) =>
        responsibility.skillIds.length === 0 ||
        responsibility.skillIds.some((skillId) => trackSkillIds.has(skillId))
    ),
    techStack: event.techStack.filter((skill) => trackSkillIds.has(skill.id)),
    skills: event.skills.filter((skill) => trackSkillIds.has(skill.id)),
  }));
};
