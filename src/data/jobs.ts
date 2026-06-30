import jobsData from './jobs.json';

export interface WorkExperience {
  id: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate: string | null;
  responsibilities: string[];
  skills: string[];
  logo: string;
  experienceUrl: string;
}

export const jobs: WorkExperience[] = jobsData;
