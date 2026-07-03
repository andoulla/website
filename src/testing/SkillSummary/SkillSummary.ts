import type { SkillSummary as SkillSummaryData } from '../../utils/calculateSkillYears';
import type { SkillCategory, SkillColour } from '../../utils/skillColour';

import { defaultSkillSummary } from './SkillSummary.data';

export class SkillSummary {
  private data: SkillSummaryData;

  constructor() {
    this.data = { ...defaultSkillSummary };
  }

  skill(skill: string): this {
    this.data = { ...this.data, skill };
    return this;
  }

  years(years: number): this {
    this.data = { ...this.data, years };
    return this;
  }

  category(category: SkillCategory): this {
    this.data = { ...this.data, category };
    return this;
  }

  colour(colour: SkillColour): this {
    this.data = { ...this.data, colour };
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

  mock(): SkillSummaryData {
    return { ...this.data };
  }
}
