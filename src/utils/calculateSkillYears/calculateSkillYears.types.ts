import type { SkillCategory, SkillColour } from '@/utils/skillColour';

export interface SkillCompanyYears {
  name: string;
  years: number;
}

export interface SkillSummary {
  skill: string;
  years: number;
  category: SkillCategory;
  colour: SkillColour;
  jobIds: string[];
  recommendationIds: string[];
  companyYears: SkillCompanyYears[];
}
