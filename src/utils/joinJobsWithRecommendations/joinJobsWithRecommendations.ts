import type { Recommendation } from '../../data/recommendations';
import type { WorkExperience } from '../../data/jobs';

export interface WorkExperienceWithRecommendations extends WorkExperience {
  recommendations: Recommendation[];
}

export function joinJobsWithRecommendations(
  jobs: WorkExperience[],
  recommendations: Recommendation[]
): WorkExperienceWithRecommendations[] {
  return jobs.map((job) => ({
    ...job,
    recommendations: recommendations.filter((recommendation) => recommendation.jobId === job.id),
  }));
}
