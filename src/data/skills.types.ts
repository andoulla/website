export type SkillType = 'tech' | 'skill';

export type SkillCategory = 'engineering' | 'managerial' | 'soft-skills' | 'other';

export type SkillSubCategory =
  | 'frontend-development'
  | 'testing'
  | 'styling'
  | 'design-system'
  | 'tooling'
  | 'collaboration-tools'
  | 'accessibility'
  | 'performance'
  | 'leadership'
  | 'delivery-planning'
  | 'stakeholder-management'
  | 'mentoring';

export interface Skill {
  name: string;
  category: SkillCategory;
  subCategory: SkillSubCategory;
  type: SkillType;
  synonyms: string[];
  jobIds: string[];
  recommendationIds: string[];
}
