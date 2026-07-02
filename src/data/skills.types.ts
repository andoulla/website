export type SkillType = 'tech' | 'skill';

export interface Skill {
  name: string;
  category: 'engineering' | 'managerial' | 'soft-skills' | 'other';
  type: SkillType;
  jobIds: string[];
  recommendationIds: string[];
}
