import type { Skill, TimelineEventWithRecommendations } from '@/types';

// Skills actually referenced by the loaded career history, deduped by id.
export const deriveAllSkills = (careerHistory: TimelineEventWithRecommendations[]): Skill[] => {
  const byId = new Map<string, Skill>();

  careerHistory.forEach((event) => {
    [...event.skills, ...event.techStack].forEach((skill) => byId.set(skill.id, skill));
  });

  return [...byId.values()];
};
