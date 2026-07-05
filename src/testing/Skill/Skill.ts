import type { Skill as SkillType, SkillType as SkillEntryType } from '@/data/skills.types';

import { defaultSkill } from './Skill.data';

export class Skill {
  private data: SkillType;

  constructor() {
    this.data = { ...defaultSkill };
  }

  name(name: string): this {
    this.data = { ...this.data, name };
    return this;
  }

  category(category: SkillType['category']): this {
    this.data = { ...this.data, category };
    return this;
  }

  type(type: SkillEntryType): this {
    this.data = { ...this.data, type };
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
