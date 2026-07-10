import type { Skill, SkillCategory, SkillSubCategory } from './skills.types';
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

skillsData.forEach((skill) => {
  if (!(VALID_CATEGORIES as string[]).includes(skill.category)) {
    throw new Error(
      `skills.json: unrecognised category "${skill.category}" on skill "${skill.name}"`
    );
  }
  if (!(VALID_SUBCATEGORIES as string[]).includes(skill.subCategory)) {
    throw new Error(
      `skills.json: unrecognised subCategory "${skill.subCategory}" on skill "${skill.name}"`
    );
  }
});

export const skills = skillsData as unknown as Skill[];
