import type { Skill, SkillCategory, SkillSubCategory, SkillType } from '@/types';

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

// Raw JSON shape before validation — id typed optional so the missing-id guard stays honest
// even though the committed data always carries one.
interface RawSkill {
  id?: string;
  name: string;
  category: string;
  subCategory: string;
  type: string;
  synonyms: string[];
  jobIds: string[];
  recommendationIds: string[];
}

const toSkill = (skill: RawSkill): Skill => {
  const { id, name, category, subCategory, type, synonyms, jobIds, recommendationIds } = skill;

  if (id === undefined || id === '') {
    throw new Error(`skills.json: missing id on skill "${name}"`);
  }
  if (!isValidCategory(category)) {
    throw new Error(`skills.json: unrecognised category "${category}" on skill "${name}"`);
  }
  if (!isValidSubCategory(subCategory)) {
    throw new Error(`skills.json: unrecognised subCategory "${subCategory}" on skill "${name}"`);
  }
  if (!isValidType(type)) {
    throw new Error(`skills.json: unrecognised type "${type}" on skill "${name}"`);
  }

  return { id, name, category, subCategory, type, synonyms, jobIds, recommendationIds };
};

// A display name (name or synonym) must resolve to exactly one skill — deep links and the
// mapping draft script match on these tokens.
const assertUniqueIdentity = (allSkills: Skill[]): void => {
  const seenIds = new Map<string, string>();
  const seenTokens = new Map<string, string>();

  for (const skill of allSkills) {
    const existingId = seenIds.get(skill.id);
    if (existingId !== undefined) {
      throw new Error(`skills.json: duplicate id "${skill.id}"`);
    }
    seenIds.set(skill.id, skill.name);

    const tokens = new Set([skill.name, ...skill.synonyms].map((token) => token.toLowerCase()));
    for (const token of tokens) {
      const owner = seenTokens.get(token);
      if (owner !== undefined) {
        throw new Error(`skills.json: "${token}" appears on both "${owner}" and "${skill.name}"`);
      }
      seenTokens.set(token, skill.name);
    }
  }
};

export const skills = skillsData.map(toSkill);

assertUniqueIdentity(skills);
