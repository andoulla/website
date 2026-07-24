import type { SkillType } from '@/types';
import type {
  SkillCompanyYears,
  SkillSummary as SkillSummaryData,
} from '@/utils/calculateSkillYears';
import type { SkillColour } from '@/utils/skillColour';

import { defaultSkillSummary } from './SkillSummary.data';

export class SkillSummary {
  private data: SkillSummaryData;

  constructor() {
    this.data = { ...defaultSkillSummary };
  }

  id(id: string): this {
    this.data = { ...this.data, id };

    return this;
  }

  skill(skill: string): this {
    this.data = { ...this.data, skill };

    return this;
  }

  type(type: SkillType): this {
    this.data = { ...this.data, type };

    return this;
  }

  years(years: number): this {
    this.data = { ...this.data, years };

    return this;
  }

  categoryId(categoryId: string): this {
    this.data = { ...this.data, categoryId };

    return this;
  }

  categoryName(categoryName: string): this {
    this.data = { ...this.data, categoryName };

    return this;
  }

  categoryIndex(categoryIndex: number): this {
    this.data = { ...this.data, categoryIndex };

    return this;
  }

  subCategoryId(subCategoryId: string): this {
    this.data = { ...this.data, subCategoryId };

    return this;
  }

  subCategoryName(subCategoryName: string): this {
    this.data = { ...this.data, subCategoryName };

    return this;
  }

  colour(colour: SkillColour): this {
    this.data = { ...this.data, colour };

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

  companyYears(companyYears: SkillCompanyYears[]): this {
    this.data = { ...this.data, companyYears };

    return this;
  }

  mock(): SkillSummaryData {
    return { ...this.data };
  }
}
