import { ARTIFICIAL_DELAY_MS } from '../../constants';
import type { WorkExperienceWithRecommendations } from '../../types';
import { joinJobsWithRecommendations } from '../joinJobsWithRecommendations';

export async function loadExperiences(): Promise<WorkExperienceWithRecommendations[]> {
  // Dynamic import() code-splits the data so it isn't pulled in at module load; the
  // third Promise.all entry runs the artificial delay concurrently with the imports.
  const [{ jobs }, { recommendations }] = await Promise.all([
    import('../../data/jobs'),
    import('../../data/recommendations'),
    new Promise((resolve) => setTimeout(resolve, ARTIFICIAL_DELAY_MS)),
  ]);

  return joinJobsWithRecommendations(jobs, recommendations);
}
