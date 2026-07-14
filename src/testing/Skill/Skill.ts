import type { Skill as SkillType, SkillType as SkillEntryType } from '@/types';

import { defaultSkill } from './Skill.data';

export class Skill {
  private data: SkillType;

  constructor() {
    this.data = { ...defaultSkill };
  }

  id(id: string): this {
    this.data = { ...this.data, id };
    return this;
  }

  name(name: string): this {
    this.data = { ...this.data, name };
    return this;
  }

  category(category: SkillType['category']): this {
    this.data = { ...this.data, category };
    return this;
  }

  subCategory(subCategory: SkillType['subCategory']): this {
    this.data = { ...this.data, subCategory };
    return this;
  }

  type(type: SkillEntryType): this {
    this.data = { ...this.data, type };
    return this;
  }

  synonyms(synonyms: string[]): this {
    this.data = { ...this.data, synonyms };
    return this;
  }

  jobIds(jobIds: string[]): this {
    this.data = { ...this.data, jobIds };
    return this;
  }

  recommendationIds(recommendationIds: string[]): this {
    this.data = { ...this.data, recommendationIds };
    return this;
  }

  mock(): SkillType {
    return { ...this.data };
  }
}
