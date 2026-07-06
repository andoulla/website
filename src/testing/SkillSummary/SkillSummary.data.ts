import type { SkillSummary } from '@/utils/calculateSkillYears';

export const defaultSkillSummary: SkillSummary = {
  skill: 'React',
  years: 1,
  category: 'engineering',
  subCategory: 'frontend-development',
  colour: 'primary',
  jobIds: ['job-1'],
  recommendationIds: [],
  companyYears: [{ name: 'Acme Corp', years: 1 }],
};
