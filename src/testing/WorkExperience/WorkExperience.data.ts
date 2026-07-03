import type { WorkExperienceWithRecommendations } from '../../types';

export const defaultWorkExperience: WorkExperienceWithRecommendations = {
  id: 'job-1',
  companyName: 'Acme Corp',
  location: 'Remote',
  startDate: '2020-01-01',
  endDate: null,
  responsibilities: [],
  logo: '',
  experienceUrl: 'https://www.linkedin.com/in/example/details/experience/',
  recommendations: [],
  techStack: [],
  skills: [],
};
