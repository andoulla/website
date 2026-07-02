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
