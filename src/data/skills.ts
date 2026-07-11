import type { Skill, SkillCategory, SkillSubCategory, SkillType } from './skills.types';
import skillsData from './skills.json';

const VALID_CATEGORIES: SkillCategory[] = [
  'engineering',
  'quality-performance',
  'tooling',
  'leadership-delivery',
  'people-stakeholders',
];

const VALID_SUBCATEGORIES: SkillSubCategory[] = [
  'development',
  'testing',
  'styling',
  'design-system',
  'tooling',
  'collaboration-tools',
  'accessibility',
  'performance',
  'leadership',
  'delivery-planning',
  'stakeholder-management',
  'mentoring',
];

const VALID_TYPES: SkillType[] = ['tech', 'skill'];

const isValidCategory = (category: string): category is SkillCategory =>
  (VALID_CATEGORIES as string[]).includes(category);

const isValidSubCategory = (subCategory: string): subCategory is SkillSubCategory =>
  (VALID_SUBCATEGORIES as string[]).includes(subCategory);

const isValidType = (type: string): type is SkillType => (VALID_TYPES as string[]).includes(type);

const toSkill = (skill: (typeof skillsData)[number]): Skill => {
  const { name, category, subCategory, type, synonyms, jobIds, recommendationIds } = skill;

  if (!isValidCategory(category)) {
    throw new Error(`skills.json: unrecognised category "${category}" on skill "${name}"`);
  }
  if (!isValidSubCategory(subCategory)) {
    throw new Error(`skills.json: unrecognised subCategory "${subCategory}" on skill "${name}"`);
  }
  if (!isValidType(type)) {
    throw new Error(`skills.json: unrecognised type "${type}" on skill "${name}"`);
  }

  return { name, category, subCategory, type, synonyms, jobIds, recommendationIds };
};

export const skills = skillsData.map(toSkill);
