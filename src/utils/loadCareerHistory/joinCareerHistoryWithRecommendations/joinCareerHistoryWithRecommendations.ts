import type {
  Recommendation,
  Skill,
  TimelineEvent,
  TimelineEventWithRecommendations,
} from '@/types';

export const joinCareerHistoryWithRecommendations = (
  careerHistory: TimelineEvent[],
  recommendations: Recommendation[],
  skills: Skill[]
): TimelineEventWithRecommendations[] => {
  // Validate that all jobIds and recommendationIds can be resolved
  const jobIds = new Set(careerHistory.map((event) => event.id));
  const recommendationIds = new Set(recommendations.map((rec) => rec.id));

  for (const skill of skills) {
    for (const jobId of skill.jobIds) {
      if (!jobIds.has(jobId)) {
        throw new Error(`skills.json: unknown jobId "${jobId}" on skill "${skill.name}"`);
      }
    }

    for (const recId of skill.recommendationIds) {
      if (!recommendationIds.has(recId)) {
        throw new Error(
          `skills.json: unknown recommendationId "${recId}" on skill "${skill.name}"`
        );
      }
    }
  }

  return careerHistory.map((event) => ({
    ...event,
    recommendations: recommendations.filter((recommendation) => recommendation.jobId === event.id),
    techStack: skills.filter((skill) => skill.type === 'tech' && skill.jobIds.includes(event.id)),
    skills: skills.filter((skill) => skill.type === 'skill' && skill.jobIds.includes(event.id)),
  }));
};
