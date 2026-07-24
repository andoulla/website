import type { SkillType } from '@/types';
import type { SkillColour } from '@/utils/skillColour';

export interface SkillCompanyYears {
  name: string;
  years: number;
}

export interface SkillSummary {
  id: string;
  // Display name — keep the key name: charts bind to dataKey="skill".
  skill: string;
  // 'skill' vs 'tech' — drives the tech-vs-soft split.
  type: SkillType;
  years: number;
  categoryId: string;
  categoryName: string;
  categoryIndex: number;
  subCategoryId: string;
  subCategoryName: string;
  colour: SkillColour;
  synonyms: string[];
  jobIds: string[];
  recommendationIds: string[];
  companyYears: SkillCompanyYears[];
}
