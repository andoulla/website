import { ARTIFICIAL_DELAY_MS } from '../../constants';
import { joinJobsWithReferences } from '../joinJobsWithReferences';
import type { WorkExperienceWithReferences } from '../joinJobsWithReferences';

export async function loadExperiences(): Promise<WorkExperienceWithReferences[]> {
  // Dynamic import() code-splits the data so it isn't pulled in at module load; the
  // third Promise.all entry runs the artificial delay concurrently with the imports.
  const [{ jobs }, { references }] = await Promise.all([
    import('../../data/jobs'),
    import('../../data/references'),
    new Promise((resolve) => setTimeout(resolve, ARTIFICIAL_DELAY_MS)),
  ]);

  return joinJobsWithReferences(jobs, references);
}
