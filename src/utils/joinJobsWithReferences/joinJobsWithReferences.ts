import type { Reference } from '../../data/references';
import type { WorkExperience } from '../../data/jobs';

export interface WorkExperienceWithReferences extends WorkExperience {
  references: Reference[];
}

export function joinJobsWithReferences(
  jobs: WorkExperience[],
  references: Reference[]
): WorkExperienceWithReferences[] {
  return jobs.map((job) => ({
    ...job,
    references: references.filter((reference) => reference.jobId === job.id),
  }));
}
