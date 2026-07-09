import type { Skill } from '@/data/skills.types';
import type { Recommendation, TimelineEvent, TimelineEventWithRecommendations } from '@/types';

export const joinJobsWithRecommendations = (
  jobs: TimelineEvent[],
  recommendations: Recommendation[],
  skills: Skill[]
): TimelineEventWithRecommendations[] => {
  return jobs.map((job) => ({
    ...job,
    recommendations: recommendations.filter((recommendation) => recommendation.jobId === job.id),
    techStack: skills
      .filter((skill) => skill.type === 'tech' && skill.jobIds.includes(job.id))
      .map((skill) => skill.name),
    skills: skills
      .filter((skill) => skill.type === 'skill' && skill.jobIds.includes(job.id))
      .map((skill) => skill.name),
  }));
};
