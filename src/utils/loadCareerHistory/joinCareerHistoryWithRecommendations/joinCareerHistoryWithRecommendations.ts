import type { Skill } from '@/data/skills.types';
import type { Recommendation, TimelineEvent, TimelineEventWithRecommendations } from '@/types';

export const joinCareerHistoryWithRecommendations = (
  careerHistory: TimelineEvent[],
  recommendations: Recommendation[],
  skills: Skill[]
): TimelineEventWithRecommendations[] => {
  return careerHistory.map((event) => ({
    ...event,
    recommendations: recommendations.filter((recommendation) => recommendation.jobId === event.id),
    techStack: skills
      .filter((skill) => skill.type === 'tech' && skill.jobIds.includes(event.id))
      .map((skill) => skill.name),
    skills: skills
      .filter((skill) => skill.type === 'skill' && skill.jobIds.includes(event.id))
      .map((skill) => skill.name),
  }));
};
