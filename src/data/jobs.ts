import jobsData from './jobs.json';

export interface WorkExperience {
  id: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate: string | null;
  responsibilities: string[];
  skills: string[];
  techStack: string[];
  logo: string;
  experienceUrl: string;
}
// TODO: move to a better location
export const jobs: WorkExperience[] = jobsData;
