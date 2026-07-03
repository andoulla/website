import type { Skill } from '../../data/skills.types';
import type { Recommendation, TimelineEvent, TimelineEventWithRecommendations } from '../../types';

export type { TimelineEventWithRecommendations } from '../../types';

export const joinJobsWithRecommendations = (
  jobs: TimelineEvent[],
  recommendations: Recommendation[],
  skills: Skill[]
): TimelineEventWithRecommendations[] => {
  return jobs.map((job) => ({
    ...job,
    recommendations: recommendations.filter((r) => r.jobId === job.id),
    techStack: skills
      .filter((s) => s.type === 'tech' && s.jobIds.includes(job.id))
      .map((s) => s.name),
    skills: skills
      .filter((s) => s.type === 'skill' && s.jobIds.includes(job.id))
      .map((s) => s.name),
  }));
};
