import type {
  Recommendation,
  WorkExperience,
  WorkExperienceWithRecommendations,
} from '../../types';

export function joinJobsWithRecommendations(
  jobs: WorkExperience[],
  recommendations: Recommendation[]
): WorkExperienceWithRecommendations[] {
  return jobs.map((job) => ({
    ...job,
    recommendations: recommendations.filter((recommendation) => recommendation.jobId === job.id),
  }));
}
