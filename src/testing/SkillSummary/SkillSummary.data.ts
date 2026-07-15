import type { SkillSummary } from '@/utils/calculateSkillYears';

export const defaultSkillSummary: SkillSummary = {
  id: 'react',
  skill: 'React',
  years: 1,
  categoryId: 'frontend-development',
  categoryName: 'Frontend Development',
  categoryIndex: 0,
  subCategoryId: 'core-technologies',
  subCategoryName: 'Core Technologies',
  colour: 'teal',
  synonyms: [],
  jobIds: ['job-1'],
  recommendationIds: [],
  companyYears: [{ name: 'Acme Corp', years: 1 }],
};
