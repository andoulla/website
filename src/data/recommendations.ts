import recommendationsData from './recommendations.json';
import type { WorkExperience } from './jobs';

export interface Recommendation {
  id: string;
  jobId: WorkExperience['id'];
  authorInitials: string;
  authorRole: {
    jobTitle: string;
    company: string;
  };
  text: string;
  postedDate: string;
  recommendationUrl: string;
}

export const recommendations: Recommendation[] = recommendationsData;
