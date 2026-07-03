import type { WorkExperience } from './workExperience';

export interface Recommendation {
  id: string;
  jobId: WorkExperience['id'];
  authorInitials: string;
  authorRole: {
    jobTitle: string;
  };
  text: string;
  postedDate: string;
  recommendationUrl: string;
}
