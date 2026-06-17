import referencesData from './references.json';
import type { WorkExperience } from './jobs';

export interface Reference {
  id: string;
  jobId: WorkExperience['id'];
  authorName: string;
  authorRole: string;
  quote: string;
}

export const references: Reference[] = referencesData;
