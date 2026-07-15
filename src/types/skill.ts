export type SkillType = 'tech' | 'skill';

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  synonyms: string[];
  jobIds: string[];
  recommendationIds: string[];
}
