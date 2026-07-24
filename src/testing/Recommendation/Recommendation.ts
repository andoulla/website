import type { Recommendation as RecommendationType } from '@/types';

import { defaultRecommendation } from './Recommendation.data';

export class Recommendation {
  private data: RecommendationType;

  constructor() {
    this.data = { ...defaultRecommendation };
  }

  id(id: string): this {
    this.data = { ...this.data, id };

    return this;
  }

  jobId(jobId: string): this {
    this.data = { ...this.data, jobId };

    return this;
  }

  authorInitials(authorInitials: string): this {
    this.data = { ...this.data, authorInitials };

    return this;
  }

  authorRole(authorRole: RecommendationType['authorRole']): this {
    this.data = { ...this.data, authorRole };

    return this;
  }

  text(text: string): this {
    this.data = { ...this.data, text };

    return this;
  }

  postedDate(postedDate: string): this {
    this.data = { ...this.data, postedDate };

    return this;
  }

  recommendationUrl(recommendationUrl: string): this {
    this.data = { ...this.data, recommendationUrl };

    return this;
  }

  mock(): RecommendationType {
    return { ...this.data };
  }
}
