import type { WorkExperience } from './workExperience';

export interface Recommendation {
  id: string;
  jobId: WorkExperience['id'];
  authorInitials: string;
  authorRole: {
    jobTitle: string;
    company: string;
  };
  text: string;
  skills: string[];
  postedDate: string;
  recommendationUrl: string;
}
