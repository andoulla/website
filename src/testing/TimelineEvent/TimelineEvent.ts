import type { Recommendation, Responsibility, TimelineEventWithRecommendations } from '@/types';

import { defaultTimelineEvent } from './TimelineEvent.data';

export class TimelineEvent {
  private data: TimelineEventWithRecommendations;

  constructor() {
    this.data = { ...defaultTimelineEvent };
  }

  id(id: string): this {
    this.data = { ...this.data, id };
    return this;
  }

  type(type: 'work' | 'education' | 'other'): this {
    this.data = { ...this.data, type };
    return this;
  }

  companyName(companyName: string): this {
    this.data = { ...this.data, companyName };
    return this;
  }

  title(title: string): this {
    this.data = { ...this.data, title };
    return this;
  }

  location(location: string): this {
    this.data = { ...this.data, location };
    return this;
  }

  startDate(startDate: string): this {
    this.data = { ...this.data, startDate };
    return this;
  }

  endDate(endDate: string | null): this {
    this.data = { ...this.data, endDate };
    return this;
  }

  responsibilities(responsibilities: Responsibility[]): this {
    this.data = { ...this.data, responsibilities };
    return this;
  }

  recommendations(recommendations: Recommendation[]): this {
    this.data = { ...this.data, recommendations };
    return this;
  }

  techStack(techStack: string[]): this {
    this.data = { ...this.data, techStack };
    return this;
  }

  skills(skills: string[]): this {
    this.data = { ...this.data, skills };
    return this;
  }

  mock(): TimelineEventWithRecommendations {
    return { ...this.data };
  }
}
