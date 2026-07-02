import type { SkillCategory, SkillColour } from '../skillColour';

export interface SkillSummary {
  skill: string;
  years: number;
  category: SkillCategory;
  colour: SkillColour;
}
