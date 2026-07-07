import type { SkillSubCategory } from '@/data/skills.types';
import type { SkillCategory, SkillColour } from '@/utils/skillColour';

export interface SkillCompanyYears {
  name: string;
  years: number;
}

export interface SkillSummary {
  skill: string;
  years: number;
  category: SkillCategory;
  subCategory: SkillSubCategory;
  colour: SkillColour;
  synonyms: string[];
  jobIds: string[];
  recommendationIds: string[];
  companyYears: SkillCompanyYears[];
}
